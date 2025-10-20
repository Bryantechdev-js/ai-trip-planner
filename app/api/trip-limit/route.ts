import arcjet, { tokenBucket } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Different rate limiting rules for different plans
const freeUserAj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 1, // 1 trip per day
      interval: 86400, // 24 hours
      capacity: 1,
    }),
  ],
});

const proUserAj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 10, // 10 trips per month
      interval: 2592000, // 30 days
      capacity: 10,
    }),
  ],
});

const premiumUserAj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 20, // 20 trips per 2 months
      interval: 5184000, // 60 days
      capacity: 20,
    }),
  ],
});

interface PlanLimits {
  trips: number;
  interval: number; // in seconds
  intervalName: string;
  price: string;
  currency: string;
}

const PLAN_LIMITS: { [key: string]: PlanLimits } = {
  'basic': {
    trips: 1,
    interval: 86400, // 1 day
    intervalName: 'day',
    price: 'Free',
    currency: ''
  },
  'pro': {
    trips: 10,
    interval: 2592000, // 30 days
    intervalName: 'month',
    price: '5,000',
    currency: 'XAF'
  },
  'premium': {
    trips: 20,
    interval: 5184000, // 60 days
    intervalName: '2 months',
    price: '9,000',
    currency: 'XAF'
  },
  'enterprise': {
    trips: -1, // unlimited
    interval: 31536000, // 1 year
    intervalName: 'year',
    price: '25,000',
    currency: 'XAF'
  }
};

async function getUserSubscription(userId: string) {
  try {
    const user = await convex.query(api.CreateNewUser.getUserById, { userId });
    return user?.subscription || 'basic';
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return 'basic'; // Default to basic plan
  }
}

function getArcjetInstance(subscription: string) {
  switch (subscription) {
    case 'pro':
      return proUserAj;
    case 'premium':
      return premiumUserAj;
    case 'enterprise':
      return null; // No limits for enterprise
    default:
      return freeUserAj;
  }
}

function calculateDueDate(subscription: string): Date {
  const now = new Date();
  const planLimits = PLAN_LIMITS[subscription] || PLAN_LIMITS['basic'];
  
  return new Date(now.getTime() + (planLimits.interval * 1000));
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(userId);
    const planLimits = PLAN_LIMITS[subscription] || PLAN_LIMITS['basic'];
    
    // Enterprise users have unlimited trips
    if (subscription === 'enterprise') {
      return NextResponse.json({ 
        allowed: true,
        remaining: -1, // unlimited
        subscription,
        planLimits,
        dueDate: calculateDueDate(subscription).toISOString()
      });
    }

    const aj = getArcjetInstance(subscription);
    if (!aj) {
      return NextResponse.json({ 
        allowed: true,
        remaining: -1,
        subscription,
        planLimits
      });
    }

    const decision = await aj.protect(req, { userId, requested: 1 });
    console.log(`Trip limit decision for ${subscription} user:`, decision);

    if (decision.isDenied()) {
      const upgradeMessage = subscription === 'basic' 
        ? "Upgrade to Pro for 10 trips per month or Premium for 20 trips per 2 months."
        : "You've reached your plan limit. Consider upgrading to a higher tier.";
        
      return NextResponse.json(
        { 
          error: `${planLimits.intervalName.charAt(0).toUpperCase() + planLimits.intervalName.slice(1)} trip limit reached`,
          message: `You can only create ${planLimits.trips} trip${planLimits.trips > 1 ? 's' : ''} per ${planLimits.intervalName}. ${upgradeMessage}`,
          reason: decision.reason,
          resetTime: decision.reason.resetTime,
          subscription,
          planLimits,
          dueDate: calculateDueDate(subscription).toISOString(),
          upgradeRequired: true
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ 
      allowed: true,
      remaining: decision.reason.remaining,
      resetTime: decision.reason.resetTime,
      subscription,
      planLimits,
      dueDate: calculateDueDate(subscription).toISOString()
    });

  } catch (error) {
    console.error('Trip limit check error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(userId);
    const planLimits = PLAN_LIMITS[subscription] || PLAN_LIMITS['basic'];
    
    // Enterprise users have unlimited trips
    if (subscription === 'enterprise') {
      return NextResponse.json({
        remaining: -1,
        canCreateTrip: true,
        subscription,
        planLimits,
        dueDate: calculateDueDate(subscription).toISOString()
      });
    }

    const aj = getArcjetInstance(subscription);
    if (!aj) {
      return NextResponse.json({
        remaining: -1,
        canCreateTrip: true,
        subscription,
        planLimits
      });
    }

    // Check current limit status without consuming tokens
    const decision = await aj.protect(req, { userId, requested: 0 });
    
    return NextResponse.json({
      remaining: decision.reason.remaining || 0,
      resetTime: decision.reason.resetTime,
      canCreateTrip: (decision.reason.remaining || 0) > 0,
      subscription,
      planLimits,
      dueDate: calculateDueDate(subscription).toISOString()
    });

  } catch (error) {
    console.error('Trip limit status error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
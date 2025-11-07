import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const PLAN_LIMITS = {
  basic: { trips: 1, period: 'daily' },
  pro: { trips: 10, period: 'monthly' },
  premium: { trips: 20, period: 'bimonthly' },
  enterprise: { trips: -1, period: 'unlimited' }
};

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const userPlan = user.publicMetadata?.plan as string || 'basic';
    const planLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];

    if (planLimit.trips === -1) {
      return NextResponse.json({ allowed: true });
    }

    // Check trip count based on plan period
    const now = new Date();
    let startDate: Date;

    switch (planLimit.period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'bimonthly':
        const monthsBack = now.getMonth() % 2 === 0 ? 2 : 1;
        startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
        break;
      default:
        startDate = new Date(0);
    }

    // In a real app, you'd check against a database
    // For now, we'll use a simple localStorage-like approach via headers
    const tripCountHeader = req.headers.get('x-trip-count') || '0';
    const tripCount = parseInt(tripCountHeader);

    if (tripCount >= planLimit.trips) {
      return NextResponse.json({
        message: `You've reached your ${planLimit.period} limit of ${planLimit.trips} trip${planLimit.trips > 1 ? 's' : ''}. Upgrade to create more!`,
        planLimits: PLAN_LIMITS,
        currentPlan: userPlan,
        upgradeUrl: '/pricing'
      }, { status: 429 });
    }

    return NextResponse.json({ 
      allowed: true,
      remaining: planLimit.trips - tripCount - 1,
      planLimits: PLAN_LIMITS,
      currentPlan: userPlan
    });

  } catch (error) {
    console.error('Trip limit check error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
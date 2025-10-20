import arcjet, { tokenBucket } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      characteristics: ["userId"], // track requests by user ID
      refillRate: 1, // refill 1 token per day
      interval: 86400, // 24 hours in seconds
      capacity: 1, // bucket maximum capacity of 1 token (1 trip per day)
    }),
  ],
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decision = await aj.protect(req, { userId, requested: 1 });
    console.log("Trip limit decision", decision);

    if (decision.isDenied()) {
      return NextResponse.json(
        { 
          error: "Daily trip limit reached", 
          message: "You can only create 1 trip per day. Upgrade your plan for unlimited trips.",
          reason: decision.reason,
          resetTime: decision.reason.resetTime
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ 
      allowed: true,
      remaining: decision.reason.remaining,
      resetTime: decision.reason.resetTime
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

    // Check current limit status without consuming tokens
    const decision = await aj.protect(req, { userId, requested: 0 });
    
    return NextResponse.json({
      remaining: decision.reason.remaining || 0,
      resetTime: decision.reason.resetTime,
      canCreateTrip: (decision.reason.remaining || 0) > 0
    });

  } catch (error) {
    console.error('Trip limit status error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
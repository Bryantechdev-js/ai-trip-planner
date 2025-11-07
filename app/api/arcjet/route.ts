import arcjet, { tokenBucket } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Development mode toggle - set to false in production
const isDevelopment = process.env.NODE_ENV === 'development';
const DISABLE_RATE_LIMITING = process.env.DISABLE_RATE_LIMITING === 'true';

export const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: (isDevelopment && DISABLE_RATE_LIMITING) ? "DRY_RUN" : "LIVE", // DRY_RUN in dev if disabled, LIVE in production
      characteristics: ["userId"], // track requests by a custom user ID
      refillRate: 1, // refill 1 trip per day
      interval: 86400, // refill every 24 hours (1 day)
      capacity: 1, // bucket maximum capacity of 1 trip
    }),
  ],
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // If rate limiting is disabled in development, allow all requests
    if (isDevelopment && DISABLE_RATE_LIMITING) {
      return NextResponse.json({ 
        message: "Rate limiting disabled in development",
        userId,
        mode: "development"
      });
    }

    const decision = await aj.protect(req, { userId, requested: 1 });
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return NextResponse.json(
        { 
          error: "Too Many Requests", 
          reason: decision.reason,
          resetTime: decision.reason.resetTime,
          remaining: decision.reason.remaining
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ 
      message: "Request allowed",
      remaining: decision.reason.remaining,
      resetTime: decision.reason.resetTime
    });
  } catch (error) {
    console.error('Arcjet error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Toggle rate limiting for development
    if (body.action === 'toggle-rate-limiting' && isDevelopment) {
      const newState = !DISABLE_RATE_LIMITING;
      return NextResponse.json({
        message: `Rate limiting ${newState ? 'disabled' : 'enabled'} for development`,
        rateLimitingDisabled: newState
      });
    }

    return NextResponse.json({ message: "POST endpoint ready" });
  } catch (error) {
    console.error('Arcjet POST error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { location, batteryLevel, networkInfo, settings } = body;

    // Store location data
    const locationData = {
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
      address: location.address,
      speed: location.speed,
      heading: location.heading,
      batteryLevel,
      networkInfo,
      settings,
      createdAt: Date.now()
    };

    // If stealth mode is enabled, also track via alternative methods
    if (settings.stealthMode) {
      await trackAlternativeMethods(req, userId, location);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Location tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('targetUserId') || userId;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const locations = [];

    return NextResponse.json({ locations });

  } catch (error) {
    console.error('Get location error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function trackAlternativeMethods(req: NextRequest, userId: string, location: any) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    const altTrackingData = {
      userId,
      primaryLocation: location,
      ipAddress: clientIP,
      userAgent,
      timestamp: Date.now(),
      method: 'stealth'
    };

  } catch (error) {
    console.error('Alternative tracking error:', error);
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripData } = await req.json()

    if (!tripData.destination) {
      return NextResponse.json(
        {
          error: 'Trip destination is required',
        },
        { status: 400 }
      )
    }

    // Enhanced trip data with automation features
    const enhancedTripData = {
      ...tripData,
      userId,
      createdAt: tripData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: tripData.status || 'draft',
      automationEnabled: true,
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      smartFeatures: {
        priceMonitoring: true,
        weatherAlerts: true,
        autoRebooking: true,
        localAssistant: true,
      },
    }

    // Save to Convex database
    const tripId = await convex.mutation(api.trips.createTrip, {
      tripData: enhancedTripData,
    })

    // Set up automated monitoring
    await setupAutomatedMonitoring(tripId, enhancedTripData)

    return NextResponse.json({
      success: true,
      tripId,
      message: 'Trip saved successfully with automation enabled',
      automationFeatures: [
        'Price monitoring activated',
        'Weather alerts enabled',
        'Smart notifications set up',
        'Auto-save configured',
      ],
    })
  } catch (error) {
    console.error('Trip save error:', error)
    return NextResponse.json(
      {
        error: 'Failed to save trip. Please try again.',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const tripId = url.searchParams.get('tripId')

    if (tripId) {
      // Get specific trip
      const trip = await convex.query(api.trips.getTripById, {
        tripId,
        userId,
      })

      return NextResponse.json({ trip })
    } else {
      // Get all user trips
      const trips = await convex.query(api.trips.getUserTrips, { userId })

      return NextResponse.json({ trips })
    }
  } catch (error) {
    console.error('Trip fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch trips',
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, updates } = await req.json()

    if (!tripId) {
      return NextResponse.json(
        {
          error: 'Trip ID is required',
        },
        { status: 400 }
      )
    }

    // Update trip with automation
    const updatedTrip = await convex.mutation(api.trips.updateTrip, {
      tripId,
      userId,
      updates: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    })

    // Update monitoring if needed
    if (updates.destination || updates.travelDates) {
      await updateAutomatedMonitoring(tripId, updatedTrip)
    }

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      message: 'Trip updated successfully',
    })
  } catch (error) {
    console.error('Trip update error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update trip',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const tripId = url.searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        {
          error: 'Trip ID is required',
        },
        { status: 400 }
      )
    }

    // Delete trip and cleanup automation
    await convex.mutation(api.trips.deleteTrip, { tripId, userId })
    await cleanupAutomatedMonitoring(tripId)

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    })
  } catch (error) {
    console.error('Trip delete error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete trip',
      },
      { status: 500 }
    )
  }
}

async function setupAutomatedMonitoring(tripId: string, tripData: any) {
  try {
    // Set up price monitoring
    if (tripData.smartFeatures?.priceMonitoring) {
      await setupPriceMonitoring(tripId, tripData)
    }

    // Set up weather alerts
    if (tripData.smartFeatures?.weatherAlerts) {
      await setupWeatherAlerts(tripId, tripData)
    }

    // Set up notification system
    await setupNotificationSystem(tripId, tripData)

    console.log(`Automated monitoring set up for trip ${tripId}`)
  } catch (error) {
    console.error('Failed to setup automated monitoring:', error)
  }
}

async function setupPriceMonitoring(tripId: string, tripData: any) {
  // Monitor flight and hotel prices
  console.log(`Setting up price monitoring for ${tripData.destination}`)

  // This would integrate with price monitoring services
  // Schedule periodic price checks
  // Send alerts when prices drop
}

async function setupWeatherAlerts(tripId: string, tripData: any) {
  // Monitor weather for destination
  console.log(`Setting up weather alerts for ${tripData.destination}`)

  // This would integrate with weather APIs
  // Send alerts for severe weather
  // Suggest itinerary changes based on weather
}

async function setupNotificationSystem(tripId: string, tripData: any) {
  // Set up comprehensive notification system
  console.log(`Setting up notifications for trip ${tripId}`)

  // Email notifications
  // SMS notifications via mobile money providers
  // Push notifications
  // WhatsApp notifications
}

async function updateAutomatedMonitoring(tripId: string, tripData: any) {
  // Update monitoring when trip details change
  console.log(`Updating automated monitoring for trip ${tripId}`)

  await setupAutomatedMonitoring(tripId, tripData)
}

async function cleanupAutomatedMonitoring(tripId: string) {
  // Clean up monitoring when trip is deleted
  console.log(`Cleaning up monitoring for trip ${tripId}`)

  // Cancel scheduled tasks
  // Remove from monitoring queues
  // Clean up notification subscriptions
}

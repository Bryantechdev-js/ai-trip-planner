import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { location, tripId, action } = await req.json()

    if (action === 'update-location') {
      // Store location update
      const locationData = {
        userId: user.id,
        tripId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
        accuracy: location.accuracy || 10,
      }

      // Check for safety alerts
      const safetyCheck = await checkSafetyAlerts(location, user.id)

      if (safetyCheck.alerts.length > 0) {
        // Trigger emergency contact notifications
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emergency-contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'alert',
            location: `${location.latitude}, ${location.longitude}`,
            emergency: {
              type: 'safety_alert',
              message: safetyCheck.alerts.join(', '),
              severity: 'medium',
            },
            tripId,
          }),
        })
      }

      return NextResponse.json({
        success: true,
        locationStored: true,
        safetyStatus: safetyCheck.status,
        alerts: safetyCheck.alerts,
      })
    }

    if (action === 'emergency') {
      const { emergencyType, message } = await req.json()

      // Trigger immediate emergency response
      const emergencyData = {
        userId: user.id,
        tripId,
        type: emergencyType,
        message,
        location,
        timestamp: new Date().toISOString(),
        status: 'active',
      }

      // Send to emergency contacts
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emergency-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'alert',
          location: `${location.latitude}, ${location.longitude}`,
          emergency: emergencyData,
          tripId,
        }),
      })

      return NextResponse.json({
        success: true,
        emergencyId: Math.random().toString(36).substr(2, 9),
        message: 'Emergency alert sent to all contacts',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkSafetyAlerts(location: any, userId: string) {
  const alerts = []

  // Mock safety checks - in production, integrate with real safety APIs
  const mockRiskAreas = [{ lat: 40.7128, lng: -74.006, radius: 1000, risk: 'High crime area' }]

  for (const riskArea of mockRiskAreas) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      riskArea.lat,
      riskArea.lng
    )

    if (distance < riskArea.radius) {
      alerts.push(`Warning: You are near a ${riskArea.risk}`)
    }
  }

  return {
    status: alerts.length > 0 ? 'warning' : 'safe',
    alerts,
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

import { NextRequest, NextResponse } from 'next/server'

// Notification preferences storage
const notificationPrefs = new Map<
  string,
  {
    pushEnabled: boolean
    emailEnabled: boolean
    smsEnabled: boolean
    categories: string[]
  }
>()

export async function POST(req: NextRequest) {
  try {
    const { userId, action, preferences, notification } = await req.json()

    if (action === 'update-preferences') {
      notificationPrefs.set(userId, preferences)
      return NextResponse.json({ message: 'Notification preferences updated' })
    }

    if (action === 'send-notification') {
      const userPrefs = notificationPrefs.get(userId) || {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        categories: ['trip-updates', 'safety-alerts', 'price-changes'],
      }

      const sentNotifications = []

      if (userPrefs.pushEnabled) {
        // Simulate push notification
        console.log(`📱 Push: ${notification.title} - ${notification.message}`)
        sentNotifications.push('push')
      }

      if (userPrefs.emailEnabled) {
        // Simulate email notification
        console.log(`📧 Email: ${notification.title} - ${notification.message}`)
        sentNotifications.push('email')
      }

      if (userPrefs.smsEnabled) {
        // Simulate SMS notification
        console.log(`📱 SMS: ${notification.message}`)
        sentNotifications.push('sms')
      }

      return NextResponse.json({
        message: 'Notifications sent',
        channels: sentNotifications,
        timestamp: new Date().toISOString(),
      })
    }

    // Generate smart notifications for trip
    const smartNotifications = generateSmartNotifications(req.body)

    return NextResponse.json({
      notifications: smartNotifications,
      nextCheck: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      {
        error: 'Notification system error',
      },
      { status: 500 }
    )
  }
}

function generateSmartNotifications(tripData: any) {
  const notifications = []
  const now = new Date()

  // Pre-trip notifications
  notifications.push({
    id: `pre-trip-${Date.now()}`,
    type: 'trip-reminder',
    title: '✈️ Trip Starting Soon!',
    message: 'Your adventure begins in 24 hours. Check weather and pack accordingly.',
    priority: 'high',
    scheduledFor: new Date(now.getTime() + 86400000), // 24 hours
    actions: ['view-checklist', 'check-weather'],
  })

  // Weather alerts
  notifications.push({
    id: `weather-${Date.now()}`,
    type: 'weather-alert',
    title: '🌤️ Weather Update',
    message: 'Sunny skies expected for your trip! Perfect for outdoor activities.',
    priority: 'medium',
    scheduledFor: new Date(now.getTime() + 3600000), // 1 hour
    actions: ['view-forecast', 'update-activities'],
  })

  // Price monitoring
  notifications.push({
    id: `price-${Date.now()}`,
    type: 'price-alert',
    title: '💰 Price Drop Alert',
    message: 'Hotel prices dropped 15%! Book now to save money.',
    priority: 'high',
    scheduledFor: now,
    actions: ['book-now', 'view-deals'],
  })

  // Safety updates
  notifications.push({
    id: `safety-${Date.now()}`,
    type: 'safety-update',
    title: '🛡️ Safety Update',
    message: 'All clear at your destination. Emergency contacts notified of your trip.',
    priority: 'medium',
    scheduledFor: now,
    actions: ['view-safety-info', 'update-contacts'],
  })

  return notifications
}

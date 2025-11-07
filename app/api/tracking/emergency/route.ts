import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { location, emergencyContacts, batteryLevel, networkInfo } = body

    // Create emergency alert message
    const emergencyMessage = `
🚨 EMERGENCY ALERT 🚨

User needs immediate assistance!

📍 Location: ${location.latitude}, ${location.longitude}
🗺️ Google Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}
🔋 Battery: ${batteryLevel}%
📶 Network: ${networkInfo.type || 'Unknown'}
⏰ Time: ${new Date().toLocaleString()}

Please check on this person immediately or contact emergency services if needed.
    `.trim()

    // Send notifications to emergency contacts
    const notifications = await Promise.allSettled(
      emergencyContacts.map(async (contact: string) => {
        if (contact.includes('@')) {
          // Email notification
          return await sendEmailAlert(contact, emergencyMessage, location)
        } else {
          // SMS notification (you'd need to implement SMS service)
          return await sendSMSAlert(contact, emergencyMessage, location)
        }
      })
    )

    // Log emergency event
    const emergencyLog = {
      userId,
      location,
      emergencyContacts,
      batteryLevel,
      networkInfo,
      timestamp: Date.now(),
      notificationResults: notifications,
    }

    // Store emergency log in database
    // await convex.mutation(api.tracking.logEmergency, emergencyLog);

    const successCount = notifications.filter(n => n.status === 'fulfilled').length
    const failureCount = notifications.filter(n => n.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Emergency alert sent to ${successCount} contacts`,
      details: {
        successful: successCount,
        failed: failureCount,
        total: emergencyContacts.length,
      },
    })
  } catch (error) {
    console.error('Emergency alert error:', error)
    return NextResponse.json({ error: 'Failed to send emergency alert' }, { status: 500 })
  }
}

async function sendEmailAlert(email: string, message: string, location: any) {
  try {
    // You would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll simulate the email sending

    const emailData = {
      to: email,
      subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>🚨 EMERGENCY ALERT 🚨</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>Someone needs immediate assistance!</strong></p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>📍 Location:</strong> ${location.latitude}, ${location.longitude}</p>
              <p><strong>🗺️ View on Map:</strong> <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" target="_blank">Click here</a></p>
              <p><strong>⏰ Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #dc2626; font-weight: bold;">Please check on this person immediately or contact emergency services if needed.</p>
          </div>
        </div>
      `,
    }

    // Simulate email sending (replace with actual email service)
    console.log('Emergency email would be sent to:', email)
    return { success: true, contact: email, method: 'email' }
  } catch (error) {
    console.error('Email alert error:', error)
    throw error
  }
}

async function sendSMSAlert(phone: string, message: string, location: any) {
  try {
    // You would integrate with an SMS service like Twilio, AWS SNS, etc.
    // For now, we'll simulate the SMS sending

    const smsMessage = `🚨 EMERGENCY: Someone needs help! Location: ${location.latitude}, ${location.longitude} - Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}`

    // Simulate SMS sending (replace with actual SMS service)
    console.log('Emergency SMS would be sent to:', phone)
    return { success: true, contact: phone, method: 'sms' }
  } catch (error) {
    console.error('SMS alert error:', error)
    throw error
  }
}

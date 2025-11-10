import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message, category } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'bryantech.dev@gmail.com',
      subject: `[AI Trip Planner] ${category.toUpperCase()}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🌍 AI Trip Planner Contact Form</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Category:</strong> <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${category.toUpperCase()}</span></p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f1f1f1; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Received on ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">AI Trip Planner Support System</p>
          </div>
        </div>
      `,
    }

    // Auto-reply to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting AI Trip Planner! 🌍',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🌍 Thank You, ${name}!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Message Received Successfully! ✅</h2>
            
            <p style="color: #666; line-height: 1.6;">Hi ${name},</p>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for reaching out to AI Trip Planner! We've successfully received your message regarding "<strong>${subject}</strong>" and our team will review it shortly.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0; font-size: 16px;">What happens next?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Our support team will review your ${category} inquiry</li>
                <li>You'll receive a detailed response within 24 hours</li>
                <li>For urgent matters, you can call our emergency line</li>
                <li>Check your email for updates and responses</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0; font-size: 16px;">📞 Need Immediate Help?</h3>
              <p style="color: #666; margin: 0;">For travel emergencies or urgent assistance:</p>
              <p style="color: #1976d2; font-weight: bold; margin: 5px 0;">Emergency: +237 6XX XXX XXX</p>
              <p style="color: #1976d2; font-weight: bold; margin: 0;">Email: emergency@aitripplanner.com</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              While you wait, feel free to explore our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="color: #667eea; text-decoration: none;">dashboard</a> or start planning your next adventure with our AI-powered trip planner!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              <strong>The AI Trip Planner Team</strong> 🚀
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f1f1f1; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; color: #666; font-size: 14px;">This is an automated response. Please do not reply to this email.</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              Visit us: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="color: #667eea;">AI Trip Planner</a> | 
              Support: bryantech.dev@gmail.com
            </p>
          </div>
        </div>
      `,
    }

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ])

    return NextResponse.json(
      { 
        message: 'Message sent successfully! Check your email for confirmation.',
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to send message. Please try again or contact us directly at bryantech.dev@gmail.com',
        success: false 
      },
      { status: 500 }
    )
  }
}
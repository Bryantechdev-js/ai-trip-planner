import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { transactionId, status, userId, plan } = await req.json()
    
    if (status === 'completed') {
      // Update user subscription in database
      // This would typically update the user's subscription status in Convex
      console.log(`Payment completed for user ${userId}, plan: ${plan}`)
      
      return NextResponse.json({
        success: true,
        message: 'Subscription activated successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ 
      error: 'Callback processing failed' 
    }, { status: 500 })
  }
}
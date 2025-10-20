import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface PlanPricing {
  [key: string]: {
    price: number
    currency: string
    duration: number // in days
    trips: number
  }
}

const PLAN_PRICING: PlanPricing = {
  'pro': {
    price: 5000,
    currency: 'XAF',
    duration: 30,
    trips: 10
  },
  'premium': {
    price: 9000,
    currency: 'XAF', 
    duration: 60,
    trips: 20
  },
  'enterprise': {
    price: 25000,
    currency: 'XAF',
    duration: 365,
    trips: -1 // unlimited
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, amount, currency, paymentMethod, phoneNumber } = await req.json()
    
    if (!planId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Plan ID, amount, and payment method are required' 
      }, { status: 400 })
    }

    if (paymentMethod === 'momo' && !phoneNumber) {
      return NextResponse.json({ 
        error: 'Phone number is required for Mobile Money payments' 
      }, { status: 400 })
    }

    const planDetails = PLAN_PRICING[planId]
    if (!planDetails) {
      return NextResponse.json({ 
        error: 'Invalid plan selected' 
      }, { status: 400 })
    }

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Mock payment processing with Lygosap API
    const paymentData = {
      transactionId,
      amount: planDetails.price,
      currency: planDetails.currency,
      status: 'pending',
      paymentMethod,
      phoneNumber: paymentMethod === 'momo' ? phoneNumber : undefined,
      planId,
      userId,
      timestamp: Date.now()
    }

    console.log('Processing payment:', paymentData)

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock successful payment (95% success rate)
    const success = Math.random() > 0.05

    if (success) {
      // Calculate due date
      const dueDate = Date.now() + (planDetails.duration * 24 * 60 * 60 * 1000)
      
      try {
        // Update user subscription in Convex
        await convex.mutation(api.CreateNewUser.updateUserSubscription, {
          userId,
          subscription: planId,
          dueDate,
          paymentDetails: {
            planId,
            amount: planDetails.price.toString(),
            currency: planDetails.currency,
            status: 'completed'
          }
        })
        
        return NextResponse.json({
          success: true,
          transactionId: paymentData.transactionId,
          status: 'completed',
          message: `Payment successful! Your ${planId} plan is now active.`,
          planDetails: {
            ...planDetails,
            dueDate: new Date(dueDate).toISOString(),
            planId
          }
        })
      } catch (convexError) {
        console.error('Error updating subscription:', convexError)
        return NextResponse.json({
          success: true,
          transactionId: paymentData.transactionId,
          status: 'completed',
          message: 'Payment successful! Please contact support to activate your subscription.',
          warning: 'Subscription update pending'
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        status: 'failed',
        message: paymentMethod === 'momo' 
          ? 'Mobile Money payment failed. Please check your balance and try again.'
          : 'Card payment failed. Please check your card details and try again.',
        transactionId: paymentData.transactionId
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json({ 
      error: 'Payment processing failed. Please try again.' 
    }, { status: 500 })
  }
}

// GET endpoint to check payment status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const transactionId = url.searchParams.get('transactionId')
    
    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Transaction ID is required' 
      }, { status: 400 })
    }

    // Mock transaction status check
    return NextResponse.json({
      transactionId,
      status: 'completed',
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check payment status' 
    }, { status: 500 })
  }
}
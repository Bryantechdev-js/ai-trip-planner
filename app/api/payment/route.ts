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

    // Validate phone number format for mobile money
    if (paymentMethod === 'momo') {
      const phoneRegex = /^(237)?[67]\d{8}$/
      const cleanPhone = phoneNumber.replace(/\s+/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json({ 
          error: 'Invalid phone number format. Please use a valid Cameroon mobile number (MTN or Orange)' 
        }, { status: 400 })
      }
    }

    const planDetails = PLAN_PRICING[planId]
    if (!planDetails) {
      return NextResponse.json({ 
        error: 'Invalid plan selected' 
      }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `trip_${planId}_${userId}_${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    try {
      // Prepare Lygos API payment request for mobile money
      const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '') : '';
      const formattedPhone = cleanPhone.startsWith('237') ? cleanPhone : `237${cleanPhone}`;
      
      // Determine network based on phone number prefix
      const getNetworkProvider = (phone: string) => {
        const phoneDigits = phone.replace(/\D/g, '')
        const prefix = phoneDigits.startsWith('237') ? phoneDigits.substring(3, 5) : phoneDigits.substring(0, 2)
        
        // MTN prefixes: 67, 68, 65, 66
        if (['67', '68', '65', '66'].includes(prefix)) {
          return 'MTN'
        }
        // Orange prefixes: 69, 77, 78, 79
        if (['69', '77', '78', '79'].includes(prefix)) {
          return 'ORANGE'
        }
        // Default to Orange for other 7x numbers
        if (prefix.startsWith('7')) {
          return 'ORANGE'
        }
        return 'MTN' // Default fallback
      }
      
      const networkProvider = getNetworkProvider(formattedPhone)
      
      // Use the same payload structure for both payment methods
      const lygosPayload = {
        amount: planDetails.price,
        shop_name: 'AI Trip Planner',
        message: `${planId} subscription - AI Trip Planner`,
        success_url: `${baseUrl}/api/payment/callback?status=success&orderId=${orderId}&userId=${userId}&planId=${planId}`,
        failure_url: `${baseUrl}/api/payment/callback?status=failed&orderId=${orderId}`,
        order_id: orderId
      }

      console.log('Initiating Lygos payment:', lygosPayload)

      // For mobile money, use the same gateway endpoint but with different payload structure
      const apiEndpoint = 'https://api.lygosapp.com/v1/gateway';
        
      const lygosResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LYGOSAP_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(lygosPayload)
      })

      const lygosResult = await lygosResponse.json()

      if (!lygosResponse.ok) {
        console.error('Lygos API error:', lygosResult)
        return NextResponse.json({
          success: false,
          error: 'Payment gateway error. Please try again.'
        }, { status: 400 })
      }

      // Store payment details temporarily (you might want to use a database for this)
      const paymentData = {
        orderId,
        userId,
        planId,
        amount: planDetails.price,
        currency: planDetails.currency,
        paymentMethod,
        phoneNumber: paymentMethod === 'momo' ? phoneNumber : undefined,
        status: 'pending',
        timestamp: Date.now(),
        lygosTransactionId: lygosResult.transaction_id || lygosResult.id
      }

      console.log('Payment initiated:', paymentData)

      return NextResponse.json({
        success: true,
        orderId,
        paymentUrl: lygosResult.link || lygosResult.payment_url || lygosResult.checkout_url,
        message: 'Redirecting to payment page...',
        transactionId: lygosResult.id || lygosResult.transaction_id
      });

    } catch (lygosError) {
      console.error('Lygos API call failed:', lygosError)
      return NextResponse.json({
        success: false,
        error: 'Payment service unavailable. Please try again later.'
      }, { status: 500 })
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
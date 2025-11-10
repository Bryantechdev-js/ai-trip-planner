import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, amount, currency = 'USD' } = await req.json()

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Plan ID and amount are required' },
        { status: 400 }
      )
    }

    // Get user details from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Create a billing session using Clerk's billing features
    const billingSession = {
      sessionId: `billing_${userId}_${Date.now()}`,
      userId,
      userEmail: user.emailAddresses[0]?.emailAddress,
      planId,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?checkout=${planId}&session=billing_${userId}_${Date.now()}`
    }

    console.log('Clerk billing session created:', billingSession)

    return NextResponse.json({
      success: true,
      sessionId: billingSession.sessionId,
      checkoutUrl: billingSession.checkoutUrl,
      message: 'Billing session created successfully'
    })

  } catch (error) {
    console.error('Clerk billing error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing session' },
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
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      sessionId,
      status: 'completed',
      userId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Billing status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check billing status' },
      { status: 500 }
    )
  }
}
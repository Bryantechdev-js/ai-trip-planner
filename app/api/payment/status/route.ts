import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')
    const transactionId = url.searchParams.get('transactionId')

    if (!orderId && !transactionId) {
      return NextResponse.json(
        {
          error: 'Order ID or Transaction ID is required',
        },
        { status: 400 }
      )
    }

    // In a real implementation, you would check the payment status with Lygos API
    // For now, we'll simulate different statuses
    const mockStatuses = ['pending', 'completed', 'failed']
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)]

    // Simulate payment completion after some time
    const shouldComplete = Math.random() > 0.7 // 30% chance of completion
    const status = shouldComplete ? 'completed' : 'pending'

    let message = ''
    switch (status) {
      case 'pending':
        message =
          'Payment is being processed. Please complete the transaction on your mobile device.'
        break
      case 'completed':
        message = 'Payment successful! Your subscription is now active.'
        break
      case 'failed':
        message = 'Payment failed. Please try again.'
        break
    }

    return NextResponse.json({
      orderId,
      transactionId,
      status,
      message,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const orderId = url.searchParams.get('orderId')
    const userId = url.searchParams.get('userId')
    const planId = url.searchParams.get('planId')
    const transactionId = url.searchParams.get('transaction_id')

    console.log('Payment callback received:', { status, orderId, userId, planId, transactionId })

    if (!orderId || !userId) {
      return NextResponse.redirect(new URL('/pricing?error=invalid_callback', req.url))
    }

    if (status === 'success') {
      // TODO: Update user subscription in database
      // For now, we'll just redirect with success
      console.log(`Payment successful for user ${userId}, plan ${planId}`)
      
      return NextResponse.redirect(
        new URL(`/pricing?success=true&plan=${planId}`, req.url)
      )
    } else {
      console.log(`Payment failed for user ${userId}, order ${orderId}`)
      return NextResponse.redirect(
        new URL('/pricing?error=payment_failed', req.url)
      )
    }

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      new URL('/pricing?error=callback_error', req.url)
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Payment webhook received:', body)

    // Handle Lygos webhook notifications
    const { status, order_id, transaction_id, amount } = body

    if (status === 'completed' || status === 'success') {
      // TODO: Update user subscription in database
      console.log(`Payment webhook: successful payment for order ${order_id}`)
      
      return NextResponse.json({ success: true, message: 'Payment processed' })
    } else {
      console.log(`Payment webhook: failed payment for order ${order_id}`)
      return NextResponse.json({ success: false, message: 'Payment failed' })
    }

  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
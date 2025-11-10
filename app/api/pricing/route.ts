import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const pricingPlans = {
      basic: {
        name: 'Basic',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          '3 trips per month',
          'Basic AI recommendations',
          'Standard support',
          'Trip planning tools'
        ],
        limits: {
          trips: 3,
          intervalName: 'monthly'
        }
      },
      premium: {
        name: 'Premium',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited trips',
          'Advanced AI recommendations',
          'Priority support',
          'Real-time tracking',
          'Expense management',
          'Emergency assistance'
        ],
        limits: {
          trips: -1,
          intervalName: 'unlimited'
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: 49.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Premium',
          'Team collaboration',
          'Custom integrations',
          'Dedicated support',
          'Advanced analytics',
          'White-label options'
        ],
        limits: {
          trips: -1,
          intervalName: 'unlimited'
        }
      }
    }

    return NextResponse.json(pricingPlans)
  } catch (error) {
    console.error('Pricing API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}
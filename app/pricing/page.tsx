'use client'

import React, { useState } from 'react'
import { Check, Star, Zap, Crown, Sparkles, Phone, CreditCard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'

const PricingPage = () => {
  const { user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      duration: 'Forever',
      trips: 1,
      interval: 'per day',
      features: [
        '1 trip per day',
        'Basic AI planning',
        'Standard destinations',
        'Basic map integration',
        'Email support'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gray-50 border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '5,000',
      currency: 'XAF',
      duration: '1 Month',
      trips: 10,
      interval: 'per month',
      features: [
        '10 trips per month',
        'Advanced AI planning',
        'Premium destinations',
        'Interactive maps & tours',
        'Weather integration',
        'Hotel recommendations',
        'Priority support',
        'Trip sharing'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '9,000',
      currency: 'XAF',
      duration: '2 Months',
      trips: 20,
      interval: 'per 2 months',
      features: [
        '20 trips per 2 months',
        'Expert AI planning',
        'Global destinations',
        'Virtual reality tours',
        'Real-time updates',
        'Expense tracking',
        'Group planning',
        'Custom itineraries',
        '24/7 support'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '25,000',
      currency: 'XAF',
      duration: '1 Year',
      trips: 'Unlimited',
      interval: 'per year',
      features: [
        'Unlimited trips',
        'AI-powered insights',
        'Worldwide coverage',
        'Advanced analytics',
        'Team collaboration',
        'API access',
        'White-label options',
        'Dedicated support',
        'Custom integrations'
      ],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
      buttonColor: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
      popular: false
    }
  ]

  const handlePayment = async (planId: string) => {
    if (!user) {
      alert('Please sign in to upgrade your plan')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan || plan.id === 'basic') return

    if (paymentMethod === 'momo' && !phoneNumber.trim()) {
      alert('Please enter your mobile number for Mobile Money payment')
      return
    }

    setSelectedPlan(planId)
    setIsProcessing(true)

    try {
      const paymentData = {
        userId: user.id,
        planId,
        amount: plan.price,
        currency: plan.currency || 'XAF',
        paymentMethod,
        phoneNumber: paymentMethod === 'momo' ? phoneNumber : undefined
      }

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Payment initiated successfully! ${result.message}`)
        // Redirect to success page or update UI
      } else {
        alert(`Payment failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setSelectedPlan('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered trip planning with our flexible pricing options
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod('momo')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'momo'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Mobile Money</div>
                <div className="text-xs text-gray-500">MTN/Orange</div>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Credit Card</div>
                <div className="text-xs text-gray-500">Visa/Mastercard</div>
              </button>
            </div>
            
            {paymentMethod === 'momo' && (
              <div className="mt-4">
                <input
                  type="tel"
                  placeholder="Enter your mobile number (e.g., 237XXXXXXXXX)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports MTN Mobile Money and Orange Money
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {plan.price === 'Free' ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.currency}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{plan.duration}</p>
                <p className="text-sm text-gray-500">
                  {typeof plan.trips === 'number' ? plan.trips : plan.trips} trips {plan.interval}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(plan.id)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.id === 'basic'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.buttonColor + ' text-white'
                }`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : plan.id === 'basic' ? (
                  'Current Plan'
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Upgrade to {plan.name}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Premium</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Trip Generation</td>
                  <td className="text-center py-4 px-4">1/day</td>
                  <td className="text-center py-4 px-4">10/month</td>
                  <td className="text-center py-4 px-4">20/2months</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">AI Planning</td>
                  <td className="text-center py-4 px-4">Basic</td>
                  <td className="text-center py-4 px-4">Advanced</td>
                  <td className="text-center py-4 px-4">Expert</td>
                  <td className="text-center py-4 px-4">AI Insights</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Weather Integration</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Virtual Tours</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Team Collaboration</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How does Mobile Money payment work?</h3>
              <p className="text-gray-600 text-sm">
                We use Lygosap API for secure mobile money transactions. Simply enter your phone number and you'll receive a payment prompt on your device.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed my trip limit?</h3>
              <p className="text-gray-600 text-sm">
                You'll be prompted to upgrade your plan or wait until your next billing cycle to create more trips.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibent text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 7-day money-back guarantee for all paid plans. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
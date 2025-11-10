'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Check, CreditCard, Smartphone } from 'lucide-react'
import { useBilling } from './BillingProvider'
import { MobileMoneyInput } from '../ui/mobile-money-input'

interface PricingCardProps {
  plan: 'basic' | 'pro' | 'premium'
  title: string
  price: string
  mobilePrice: string
  features: string[]
  isPopular?: boolean
  isCurrentPlan?: boolean
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  title,
  price,
  mobilePrice,
  features,
  isPopular = false,
  isCurrentPlan = false,
}) => {
  const { upgradeToProPlan, upgradeToPremiumPlan, isLoading } = useBilling()
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card')
  const [mobileNumber, setMobileNumber] = useState('')

  const handleUpgrade = async () => {
    if (plan === 'basic') return
    
    if (paymentMethod === 'mobile' && !mobileNumber) {
      alert('Please enter your mobile money number')
      return
    }

    const success = plan === 'pro' 
      ? await upgradeToProPlan(paymentMethod)
      : await upgradeToPremiumPlan(paymentMethod)

    if (success) {
      setShowPaymentOptions(false)
      setMobileNumber('')
    }
  }

  return (
    <Card className={`relative p-6 ${isPopular ? 'border-primary border-2' : ''} ${isCurrentPlan ? 'bg-primary/5' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <div className="text-3xl font-bold text-primary">{price}</div>
          <div className="text-sm text-gray-600">or {mobilePrice} via Mobile Money</div>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      ) : plan === 'basic' ? (
        <Button variant="outline" disabled className="w-full">
          Free Plan
        </Button>
      ) : !showPaymentOptions ? (
        <Button 
          onClick={() => setShowPaymentOptions(true)}
          className="w-full"
          disabled={isLoading}
        >
          Upgrade to {title}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              className="flex-1"
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Card
            </Button>
            <Button
              variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('mobile')}
              className="flex-1"
              size="sm"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Money
            </Button>
          </div>

          {paymentMethod === 'mobile' && (
            <MobileMoneyInput
              value={mobileNumber}
              onChange={setMobileNumber}
              placeholder="Enter mobile money number"
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentOptions(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : `Pay ${paymentMethod === 'mobile' ? mobilePrice : price}`}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
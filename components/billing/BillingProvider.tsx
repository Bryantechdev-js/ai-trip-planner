'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-toastify'

interface BillingContextType {
  currentPlan: string
  isLoading: boolean
  upgradeToProPlan: (paymentMethod: 'card' | 'mobile') => Promise<boolean>
  upgradeToPremiumPlan: (paymentMethod: 'card' | 'mobile') => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  getBillingHistory: () => Promise<any[]>
  getRemainingTrips: () => Promise<number>
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export const useBilling = () => {
  const context = useContext(BillingContext)
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider')
  }
  return context
}

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser()
  const [currentPlan, setCurrentPlan] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const plan = (user.publicMetadata?.plan as string) || 'basic'
      setCurrentPlan(plan)
    }
  }, [user, isLoaded])

  const upgradeToProPlan = async (paymentMethod: 'card' | 'mobile'): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: 'pro',
          paymentMethod,
          amount: paymentMethod === 'mobile' ? 15000 : 15,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setCurrentPlan('pro')
        await user.update({
          publicMetadata: { ...user.publicMetadata, plan: 'pro' }
        })
        toast.success('Successfully upgraded to Pro plan!')
        return true
      } else {
        toast.error(data.message || 'Upgrade failed')
        return false
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Upgrade failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const upgradeToPremiumPlan = async (paymentMethod: 'card' | 'mobile'): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: 'premium',
          paymentMethod,
          amount: paymentMethod === 'mobile' ? 25000 : 25,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setCurrentPlan('premium')
        await user.update({
          publicMetadata: { ...user.publicMetadata, plan: 'premium' }
        })
        toast.success('Successfully upgraded to Premium plan!')
        return true
      } else {
        toast.error(data.message || 'Upgrade failed')
        return false
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Upgrade failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setCurrentPlan('basic')
        await user.update({
          publicMetadata: { ...user.publicMetadata, plan: 'basic' }
        })
        toast.success('Subscription cancelled successfully')
        return true
      } else {
        toast.error('Failed to cancel subscription')
        return false
      }
    } catch (error) {
      console.error('Cancel error:', error)
      toast.error('Failed to cancel subscription')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getBillingHistory = async (): Promise<any[]> => {
    if (!user) return []
    
    try {
      const response = await fetch(`/api/billing/history?userId=${user.id}`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Billing history error:', error)
      return []
    }
  }

  const getRemainingTrips = async (): Promise<number> => {
    if (!user) return 0
    
    try {
      const response = await fetch(`/api/trip-limit/remaining?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        return data.remaining || 0
      }
      return 0
    } catch (error) {
      console.error('Remaining trips error:', error)
      return 0
    }
  }

  return (
    <BillingContext.Provider
      value={{
        currentPlan,
        isLoading,
        upgradeToProPlan,
        upgradeToPremiumPlan,
        cancelSubscription,
        getBillingHistory,
        getRemainingTrips,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
}
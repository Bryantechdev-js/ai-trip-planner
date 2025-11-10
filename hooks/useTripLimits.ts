'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { cache } from '@/lib/cache'
import { notifications } from '@/lib/notifications'

interface TripLimitData {
  allowed: boolean
  remaining: number
  planLimits: {
    trips: number
    period: string
  }
  currentPlan: string
  upgradeUrl?: string
  message?: string
}

export function useTripLimits() {
  const { user } = useUser()
  const [limitData, setLimitData] = useState<TripLimitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkLimits = async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const cacheKey = cache.keys.tripLimits(user.id)
    
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cachedData = cache.get<TripLimitData>(cacheKey)
      if (cachedData) {
        setLimitData(cachedData)
        setIsLoading(false)
        return cachedData
      }
    }

    try {
      setError(null)
      const response = await fetch('/api/trip-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        const limitData: TripLimitData = {
          allowed: data.allowed || false,
          remaining: data.remaining || 0,
          planLimits: data.planLimits?.[data.currentPlan] || { trips: 1, period: 'daily' },
          currentPlan: data.currentPlan || 'basic',
          upgradeUrl: data.upgradeUrl,
        }

        // Cache for 1 minute
        cache.set(cacheKey, limitData, 60 * 1000)
        setLimitData(limitData)
        return limitData
      } else {
        const errorData: TripLimitData = {
          allowed: false,
          remaining: 0,
          planLimits: data.planLimits?.[data.currentPlan] || { trips: 1, period: 'daily' },
          currentPlan: data.currentPlan || 'basic',
          upgradeUrl: data.upgradeUrl,
          message: data.message,
        }
        setLimitData(errorData)
        
        if (response.status === 429) {
          notifications.tripLimitReached(
            errorData.currentPlan,
            errorData.planLimits.trips
          )
        }
        
        return errorData
      }
    } catch (err) {
      const errorMessage = 'Failed to check trip limits'
      setError(errorMessage)
      notifications.networkError()
      console.error('Trip limit check error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const canCreateTrip = (): boolean => {
    return limitData?.allowed || false
  }

  const getRemainingTrips = (): number => {
    return limitData?.remaining || 0
  }

  const getCurrentPlan = (): string => {
    return limitData?.currentPlan || 'basic'
  }

  const shouldShowUpgrade = (): boolean => {
    return limitData?.currentPlan === 'basic' || !limitData?.allowed
  }

  useEffect(() => {
    checkLimits()
  }, [user])

  return {
    limitData,
    isLoading,
    error,
    checkLimits,
    canCreateTrip,
    getRemainingTrips,
    getCurrentPlan,
    shouldShowUpgrade,
  }
}
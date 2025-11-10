import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = (config: RateLimitConfig) => {
  return (req: NextRequest, identifier: string) => {
    const now = Date.now()
    const key = `${identifier}_${Math.floor(now / config.windowMs)}`
    
    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs }
    
    if (now > current.resetTime) {
      current.count = 0
      current.resetTime = now + config.windowMs
    }
    
    current.count++
    rateLimitStore.set(key, current)
    
    return {
      allowed: current.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - current.count),
      resetTime: current.resetTime,
    }
  }
}

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})
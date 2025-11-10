interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    }
    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache stats
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredItems++
      } else {
        validItems++
      }
    }

    return {
      total: this.cache.size,
      valid: validItems,
      expired: expiredItems,
    }
  }

  // Clean expired items
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  // Cache keys for different data types
  static keys = {
    tripData: (userId: string, destination: string) => `trip:${userId}:${destination}`,
    weatherData: (location: string) => `weather:${location}`,
    hotelData: (location: string) => `hotels:${location}`,
    attractionData: (location: string) => `attractions:${location}`,
    userProfile: (userId: string) => `profile:${userId}`,
    tripLimits: (userId: string) => `limits:${userId}`,
    recommendations: (userId: string, type: string) => `recommendations:${userId}:${type}`,
  }
}

export const cache = new CacheService()
export default cache
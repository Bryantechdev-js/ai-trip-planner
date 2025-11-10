// Production monitoring and logging utilities
import { NextRequest } from 'next/server'

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}

interface LogEntry {
  level: string
  message: string
  timestamp: string
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      environment: process.env.NODE_ENV,
      service: 'ai-trip-planner',
    })
  }

  private log(level: string, message: string, metadata?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    }

    if (error) {
      entry.stack = error.stack
    }

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, metadata || '')
      if (error) console.error(error)
    }

    if (this.isProduction) {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      this.sendToExternalService(entry)
    }

    console.log(this.formatLog(entry))
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // Example: Send to Sentry or other monitoring service
      if (process.env.SENTRY_DSN && entry.level === 'error') {
        // Sentry integration would go here
      }

      // Example: Send to custom logging endpoint
      if (process.env.MONITORING_API_KEY) {
        await fetch('/api/internal/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`,
          },
          body: JSON.stringify(entry),
        }).catch(() => {}) // Fail silently to avoid logging loops
      }
    } catch (error) {
      // Fail silently to avoid infinite logging loops
    }
  }

  error(message: string, metadata?: Record<string, any>, error?: Error) {
    this.log(LOG_LEVELS.ERROR, message, metadata, error)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(LOG_LEVELS.WARN, message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(LOG_LEVELS.INFO, message, metadata)
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, metadata)
    }
  }
}

export const logger = new Logger()

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(operation: string): () => void {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.recordMetric(operation, duration)
    }
  }

  recordMetric(operation: string, value: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    this.metrics.get(operation)!.push(value)

    // Log slow operations
    if (value > 5000) { // 5 seconds
      logger.warn(`Slow operation detected: ${operation}`, { duration: value })
    }
  }

  getMetrics(operation: string) {
    const values = this.metrics.get(operation) || []
    if (values.length === 0) return null

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [operation, values] of this.metrics.entries()) {
      result[operation] = this.getMetrics(operation)
    }
    return result
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Request tracking middleware
export function trackRequest(req: NextRequest, operation: string) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  logger.info(`Request started: ${operation}`, {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
  })

  return {
    requestId,
    end: (statusCode?: number, error?: Error) => {
      const duration = Date.now() - startTime
      performanceMonitor.recordMetric(operation, duration)

      if (error) {
        logger.error(`Request failed: ${operation}`, {
          requestId,
          duration,
          statusCode,
          error: error.message,
        }, error)
      } else {
        logger.info(`Request completed: ${operation}`, {
          requestId,
          duration,
          statusCode,
        })
      }
    }
  }
}

// Health check utilities
export interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  lastChecked: string
}

export class HealthChecker {
  async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now()
    try {
      // Check Convex connection
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/ping`, {
        method: 'GET',
        timeout: 5000,
      })
      
      return {
        service: 'database',
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString(),
      }
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString(),
      }
    }
  }

  async checkExternalAPIs(): Promise<HealthCheck[]> {
    const checks = [
      { name: 'openrouter', url: 'https://openrouter.ai/api/v1/models' },
      { name: 'clerk', url: 'https://api.clerk.dev/v1/health' },
    ]

    const results = await Promise.allSettled(
      checks.map(async (check) => {
        const start = Date.now()
        try {
          const response = await fetch(check.url, {
            method: 'GET',
            timeout: 5000,
          })
          
          return {
            service: check.name,
            status: response.ok ? 'healthy' : 'degraded' as const,
            responseTime: Date.now() - start,
            lastChecked: new Date().toISOString(),
          }
        } catch (error) {
          return {
            service: check.name,
            status: 'unhealthy' as const,
            responseTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastChecked: new Date().toISOString(),
          }
        }
      })
    )

    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            service: checks[index].name,
            status: 'unhealthy' as const,
            error: 'Health check failed',
            lastChecked: new Date().toISOString(),
          }
    )
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: HealthCheck[]
    timestamp: string
  }> {
    const checks = [
      await this.checkDatabase(),
      ...(await this.checkExternalAPIs()),
    ]

    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy'
    } else if (degradedCount > 0) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    }
  }
}

export const healthChecker = new HealthChecker()
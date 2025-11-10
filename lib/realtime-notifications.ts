'use client'

import { toast } from 'react-toastify'
import { io, Socket } from 'socket.io-client'

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'booking' | 'weather' | 'safety' | 'price'
  title: string
  message: string
  timestamp: string
  userId?: string
  tripId?: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  autoClose?: number
  persistent?: boolean
  data?: Record<string, any>
}

export class RealtimeNotificationManager {
  private socket: Socket | null = null
  private userId: string | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSocket()
    }
  }

  private initializeSocket() {
    try {
      this.socket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to initialize socket:', error)
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('🔗 Real-time notifications connected')
      
      if (this.userId) {
        this.socket?.emit('join-user-room', this.userId)
      }

      toast.success('🔔 Real-time notifications enabled', {
        position: 'top-right',
        autoClose: 3000,
      })
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('🔌 Real-time notifications disconnected')
    })

    this.socket.on('reconnect', () => {
      console.log('🔄 Real-time notifications reconnected')
      toast.info('🔄 Notifications reconnected', {
        position: 'top-right',
        autoClose: 2000,
      })
    })

    this.socket.on('notification', (data: NotificationData) => {
      this.handleNotification(data)
    })

    this.socket.on('trip-update', (data: any) => {
      this.handleTripUpdate(data)
    })

    this.socket.on('booking-status', (data: any) => {
      this.handleBookingStatus(data)
    })

    this.socket.on('weather-alert', (data: any) => {
      this.handleWeatherAlert(data)
    })

    this.socket.on('price-alert', (data: any) => {
      this.handlePriceAlert(data)
    })

    this.socket.on('safety-alert', (data: any) => {
      this.handleSafetyAlert(data)
    })

    this.socket.on('emergency-alert', (data: any) => {
      this.handleEmergencyAlert(data)
    })
  }

  public setUserId(userId: string) {
    this.userId = userId
    if (this.isConnected && this.socket) {
      this.socket.emit('join-user-room', userId)
    }
  }

  private handleNotification(data: NotificationData) {
    const toastOptions = {
      position: 'top-right' as const,
      autoClose: data.autoClose || this.getAutoCloseTime(data.priority),
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }

    switch (data.type) {
      case 'success':
        toast.success(`✅ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'error':
        toast.error(`❌ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'warning':
        toast.warning(`⚠️ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'info':
        toast.info(`ℹ️ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'booking':
        toast.success(`🎫 ${data.title}: ${data.message}`, toastOptions)
        break
      case 'weather':
        toast.info(`🌤️ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'safety':
        toast.warning(`🛡️ ${data.title}: ${data.message}`, toastOptions)
        break
      case 'price':
        toast.info(`💰 ${data.title}: ${data.message}`, toastOptions)
        break
      default:
        toast(`📢 ${data.title}: ${data.message}`, toastOptions)
    }

    // Play notification sound for high priority notifications
    if (data.priority === 'high' || data.priority === 'critical') {
      this.playNotificationSound()
    }

    // Store notification in local storage for persistence
    this.storeNotification(data)
  }

  private handleTripUpdate(data: any) {
    toast.success(`🗺️ Trip Update: ${data.message}`, {
      position: 'top-right',
      autoClose: 5000,
    })
  }

  private handleBookingStatus(data: any) {
    const icon = data.status === 'confirmed' ? '✅' : data.status === 'cancelled' ? '❌' : '⏳'
    toast.info(`${icon} Booking ${data.status}: ${data.message}`, {
      position: 'top-right',
      autoClose: 6000,
    })
  }

  private handleWeatherAlert(data: any) {
    const severity = data.severity || 'info'
    const icon = severity === 'severe' ? '🌪️' : '🌤️'
    
    if (severity === 'severe') {
      toast.warning(`${icon} Weather Alert: ${data.message}`, {
        position: 'top-center',
        autoClose: 10000,
      })
    } else {
      toast.info(`${icon} Weather Update: ${data.message}`, {
        position: 'top-right',
        autoClose: 5000,
      })
    }
  }

  private handlePriceAlert(data: any) {
    const icon = data.type === 'drop' ? '📉' : '📈'
    toast.success(`${icon} Price Alert: ${data.message}`, {
      position: 'top-right',
      autoClose: 8000,
    })
  }

  private handleSafetyAlert(data: any) {
    toast.warning(`🛡️ Safety Alert: ${data.message}`, {
      position: 'top-center',
      autoClose: 10000,
    })
  }

  private handleEmergencyAlert(data: any) {
    toast.error(`🚨 EMERGENCY: ${data.message}`, {
      position: 'top-center',
      autoClose: false, // Don't auto-close emergency alerts
      closeOnClick: false,
    })
    
    // Play urgent notification sound
    this.playUrgentNotificationSound()
  }

  private getAutoCloseTime(priority: string): number {
    switch (priority) {
      case 'critical':
        return false as any // Don't auto-close
      case 'high':
        return 10000
      case 'medium':
        return 6000
      case 'low':
        return 4000
      default:
        return 5000
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  private playUrgentNotificationSound() {
    try {
      const audio = new Audio('/urgent-notification.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore audio play errors
      })
    } catch (error) {
      console.log('Could not play urgent notification sound:', error)
    }
  }

  private storeNotification(data: NotificationData) {
    try {
      const stored = localStorage.getItem('trip-notifications') || '[]'
      const notifications = JSON.parse(stored)
      notifications.unshift(data)
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50)
      }
      
      localStorage.setItem('trip-notifications', JSON.stringify(notifications))
    } catch (error) {
      console.error('Failed to store notification:', error)
    }
  }

  public getStoredNotifications(): NotificationData[] {
    try {
      const stored = localStorage.getItem('trip-notifications') || '[]'
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to get stored notifications:', error)
      return []
    }
  }

  public clearStoredNotifications() {
    try {
      localStorage.removeItem('trip-notifications')
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  public sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot send notification')
      return
    }

    const fullNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    this.socket.emit('send-notification', fullNotification)
  }

  public joinTripRoom(tripId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-trip-room', tripId)
    }
  }

  public leaveTripRoom(tripId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-trip-room', tripId)
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.isConnected = false
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected
  }
}

// Singleton instance
export const notificationManager = new RealtimeNotificationManager()

// Utility functions for common notifications
export const showSuccessNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'success',
    title,
    message,
    priority: 'medium',
    ...options,
  })
}

export const showErrorNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'error',
    title,
    message,
    priority: 'high',
    ...options,
  })
}

export const showBookingNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'booking',
    title,
    message,
    priority: 'high',
    ...options,
  })
}

export const showWeatherNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'weather',
    title,
    message,
    priority: 'medium',
    ...options,
  })
}

export const showPriceNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'price',
    title,
    message,
    priority: 'high',
    ...options,
  })
}

export const showSafetyNotification = (title: string, message: string, options?: Partial<NotificationData>) => {
  notificationManager.sendNotification({
    type: 'safety',
    title,
    message,
    priority: 'high',
    ...options,
  })
}
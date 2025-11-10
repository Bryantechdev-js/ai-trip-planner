import { toast, ToastOptions } from 'react-toastify'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationOptions extends Omit<ToastOptions, 'type'> {
  type?: NotificationType
  title?: string
  description?: string
  duration?: number
}

class NotificationService {
  private defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }

  private formatMessage(title?: string, description?: string): string {
    if (title && description) {
      return `${title}: ${description}`
    }
    return title || description || ''
  }

  success(message: string, options?: NotificationOptions) {
    const formattedMessage = this.formatMessage(options?.title, options?.description || message)
    toast.success(formattedMessage, {
      ...this.defaultOptions,
      ...options,
      autoClose: options?.duration || 5000,
    })
  }

  error(message: string, options?: NotificationOptions) {
    const formattedMessage = this.formatMessage(options?.title, options?.description || message)
    toast.error(formattedMessage, {
      ...this.defaultOptions,
      ...options,
      autoClose: options?.duration || 8000,
    })
  }

  warning(message: string, options?: NotificationOptions) {
    const formattedMessage = this.formatMessage(options?.title, options?.description || message)
    toast.warning(formattedMessage, {
      ...this.defaultOptions,
      ...options,
      autoClose: options?.duration || 6000,
    })
  }

  info(message: string, options?: NotificationOptions) {
    const formattedMessage = this.formatMessage(options?.title, options?.description || message)
    toast.info(formattedMessage, {
      ...this.defaultOptions,
      ...options,
      autoClose: options?.duration || 5000,
    })
  }

  // Trip-specific notifications
  tripCreated(destination: string) {
    this.success(`Trip to ${destination} created successfully!`, {
      title: 'Trip Created',
      description: 'Your AI-powered itinerary is ready',
    })
  }

  tripSaved(destination: string) {
    this.success(`Trip to ${destination} saved to your bookings`, {
      title: 'Trip Saved',
    })
  }

  tripLimitReached(plan: string, limit: number) {
    this.warning(`You've reached your ${plan} plan limit of ${limit} trips`, {
      title: 'Trip Limit Reached',
      description: 'Upgrade to create more trips',
      duration: 10000,
    })
  }

  paymentSuccess(plan: string) {
    this.success(`Welcome to ${plan} plan!`, {
      title: 'Payment Successful',
      description: 'Your subscription is now active',
    })
  }

  paymentFailed(reason?: string) {
    this.error(reason || 'Payment could not be processed', {
      title: 'Payment Failed',
      description: 'Please try again or contact support',
    })
  }

  // Automation notifications
  autoBookingSuccess(hotel: string) {
    this.success(`Hotel "${hotel}" booked automatically`, {
      title: 'Auto-Booking Complete',
    })
  }

  autoBookingFailed(hotel: string) {
    this.error(`Failed to book "${hotel}" automatically`, {
      title: 'Auto-Booking Failed',
      description: 'Please book manually',
    })
  }

  smartRecommendation(type: string, count: number) {
    this.info(`${count} new ${type} recommendations available`, {
      title: 'Smart Recommendations',
    })
  }

  // System notifications
  systemError(message: string) {
    this.error(message, {
      title: 'System Error',
      description: 'Please try again or contact support',
    })
  }

  networkError() {
    this.error('Network connection issue', {
      title: 'Connection Error',
      description: 'Please check your internet connection',
    })
  }

  // Cache notifications
  cacheUpdated(type: string) {
    this.info(`${type} data updated`, {
      title: 'Data Refreshed',
      autoClose: 3000,
    })
  }
}

export const notifications = new NotificationService()
export default notifications
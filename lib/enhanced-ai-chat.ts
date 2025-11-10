'use client'

import { toast } from 'react-toastify'
import { notificationManager } from './realtime-notifications'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  ui?: string
  metadata?: {
    destination?: string
    source?: string
    budget?: string
    duration?: string
    groupSize?: string
    interests?: string[]
    automation?: Record<string, any>
  }
}

export interface ChatResponse {
  resp: string
  ui: string
  destination?: string
  source?: string
  liveMedia?: string
  automation?: Record<string, any>
  upgradeRequired?: boolean
  planLimits?: any
}

export class EnhancedAIChatManager {
  private apiEndpoint = '/api/aimodel'
  private retryAttempts = 3
  private retryDelay = 1000

  async sendMessage(
    messages: ChatMessage[],
    userId: string,
    options?: {
      onProgress?: (chunk: string) => void
      onSuccess?: (response: ChatResponse) => void
      onError?: (error: Error) => void
    }
  ): Promise<ChatResponse> {
    let attempt = 0
    
    while (attempt < this.retryAttempts) {
      try {
        // Show loading notification
        const loadingToast = toast.loading('🤖 AI is processing your request...', {
          position: 'top-right',
        })

        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            userId,
          }),
        })

        // Dismiss loading toast
        toast.dismiss(loadingToast)

        if (!response.ok) {
          if (response.status === 429) {
            const errorData = await response.json()
            toast.error('🚫 Trip limit reached! Please upgrade your plan.', {
              position: 'top-center',
              autoClose: 8000,
            })
            
            notificationManager.sendNotification({
              type: 'warning',
              title: 'Trip Limit Reached',
              message: 'You have reached your plan limit. Upgrade to continue creating trips.',
              priority: 'high',
              actionUrl: '/pricing',
            })

            throw new Error(errorData.message || 'Trip limit reached')
          }

          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`)
          }

          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ChatResponse = await response.json()

        if (!data.resp) {
          throw new Error('Invalid response format')
        }

        // Handle successful response
        this.handleSuccessfulResponse(data, userId)
        
        if (options?.onSuccess) {
          options.onSuccess(data)
        }

        return data

      } catch (error) {
        attempt++
        console.error(`Chat attempt ${attempt} failed:`, error)

        if (attempt >= this.retryAttempts) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          
          toast.error(`❌ Failed to process request: ${errorMessage}`, {
            position: 'top-right',
            autoClose: 6000,
          })

          notificationManager.sendNotification({
            type: 'error',
            title: 'Chat Error',
            message: `Failed to process your request after ${this.retryAttempts} attempts`,
            priority: 'high',
          })

          if (options?.onError) {
            options.onError(error instanceof Error ? error : new Error(errorMessage))
          }

          throw error
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
      }
    }

    throw new Error('Max retry attempts reached')
  }

  private handleSuccessfulResponse(data: ChatResponse, userId: string) {
    // Show success notifications based on UI type
    switch (data.ui) {
      case 'budgeting':
        toast.success('💰 Budget options loaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        break

      case 'hotels':
        toast.success('🏨 Hotel recommendations ready!', {
          position: 'top-right',
          autoClose: 3000,
        })
        break

      case 'trip-gallery':
        toast.success('📸 Destination gallery loaded!', {
          position: 'top-right',
          autoClose: 3000,
        })
        break

      case 'trip-map':
        toast.success('🗺️ Interactive map ready!', {
          position: 'top-right',
          autoClose: 3000,
        })
        break

      case 'virtual-tour':
        toast.success('🌍 Virtual tour experience loaded!', {
          position: 'top-right',
          autoClose: 3000,
        })
        break

      case 'final-plan':
        toast.success('🎉 Your complete trip plan is ready!', {
          position: 'top-center',
          autoClose: 5000,
        })
        
        notificationManager.sendNotification({
          type: 'success',
          title: 'Trip Plan Complete',
          message: 'Your personalized trip itinerary has been generated with all automation features enabled.',
          priority: 'high',
          actionUrl: '/dashboard',
        })
        break
    }

    // Handle destination-specific notifications
    if (data.destination) {
      toast.info(`🌍 Processing ${data.destination} information...`, {
        position: 'top-right',
        autoClose: 4000,
      })

      // Trigger automation features
      this.triggerAutomationFeatures(data.destination, userId)
    }

    // Handle automation notifications
    if (data.automation) {
      this.handleAutomationNotifications(data.automation)
    }
  }

  private async triggerAutomationFeatures(destination: string, userId: string) {
    try {
      // Trigger weather monitoring
      fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, userId }),
      }).then(() => {
        toast.info('🌤️ Weather monitoring activated for your destination', {
          position: 'top-right',
          autoClose: 4000,
        })
      }).catch(console.error)

      // Trigger safety monitoring
      fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, userId }),
      }).then(() => {
        toast.info('🛡️ Safety monitoring enabled for your trip', {
          position: 'top-right',
          autoClose: 4000,
        })
      }).catch(console.error)

      // Trigger smart recommendations
      fetch('/api/smart-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, userId }),
      }).then(() => {
        toast.info('🎯 Smart recommendations system activated', {
          position: 'top-right',
          autoClose: 4000,
        })
      }).catch(console.error)

    } catch (error) {
      console.error('Failed to trigger automation features:', error)
    }
  }

  private handleAutomationNotifications(automation: Record<string, any>) {
    if (automation.booking) {
      toast.success('🎫 Auto-booking system ready', {
        position: 'top-right',
        autoClose: 4000,
      })
    }

    if (automation.tracking) {
      toast.success('📊 Real-time expense tracking enabled', {
        position: 'top-right',
        autoClose: 4000,
      })
    }

    if (automation.safety) {
      toast.success('🚨 Emergency monitoring activated', {
        position: 'top-right',
        autoClose: 4000,
      })
    }

    if (automation.notifications) {
      toast.success('🔔 Smart alerts configured', {
        position: 'top-right',
        autoClose: 4000,
      })
    }
  }

  async sendUISelection(
    selection: string,
    type: string,
    messages: ChatMessage[],
    userId: string
  ): Promise<ChatResponse> {
    const selectionMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: `I selected: ${selection} for ${type}`,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, selectionMessage]

    try {
      const response = await this.sendMessage(updatedMessages, userId)
      
      // Show selection confirmation
      toast.success(`✅ ${selection} selected for ${type}`, {
        position: 'top-right',
        autoClose: 3000,
      })

      return response
    } catch (error) {
      toast.error(`❌ Failed to process selection: ${selection}`, {
        position: 'top-right',
        autoClose: 4000,
      })
      throw error
    }
  }

  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  formatMessage(content: string, role: 'user' | 'assistant', ui?: string): ChatMessage {
    return {
      id: this.generateMessageId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      ui,
    }
  }

  // Save chat history to local storage
  saveChatHistory(messages: ChatMessage[], tripId?: string) {
    try {
      const key = tripId ? `chat_history_${tripId}` : 'chat_history_current'
      localStorage.setItem(key, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  // Load chat history from local storage
  loadChatHistory(tripId?: string): ChatMessage[] {
    try {
      const key = tripId ? `chat_history_${tripId}` : 'chat_history_current'
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load chat history:', error)
      return []
    }
  }

  // Clear chat history
  clearChatHistory(tripId?: string) {
    try {
      const key = tripId ? `chat_history_${tripId}` : 'chat_history_current'
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear chat history:', error)
    }
  }

  // Export chat history
  exportChatHistory(messages: ChatMessage[], format: 'json' | 'txt' = 'json'): string {
    if (format === 'txt') {
      return messages
        .map(msg => `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n')
    }
    
    return JSON.stringify(messages, null, 2)
  }

  // Analyze chat for insights
  analyzeChatInsights(messages: ChatMessage[]): {
    totalMessages: number
    userMessages: number
    assistantMessages: number
    averageResponseTime: number
    topTopics: string[]
    destinations: string[]
  } {
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')
    
    const destinations = messages
      .filter(m => m.metadata?.destination)
      .map(m => m.metadata!.destination!)
      .filter((dest, index, arr) => arr.indexOf(dest) === index)

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseTime: 0, // Would need timestamps to calculate
      topTopics: [], // Would need NLP to extract
      destinations,
    }
  }
}

// Singleton instance
export const aiChatManager = new EnhancedAIChatManager()

// Utility functions
export const createUserMessage = (content: string): ChatMessage => {
  return aiChatManager.formatMessage(content, 'user')
}

export const createAssistantMessage = (content: string, ui?: string): ChatMessage => {
  return aiChatManager.formatMessage(content, 'assistant', ui)
}
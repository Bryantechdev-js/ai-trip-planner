'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Volume2, VolumeX } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import BudgetingUI from './newTripCompunents/BudgetingUI'
import GroupSizeUI from './newTripCompunents/GroupSizeUi'
import HotelsUI from './newTripCompunents/HotelsUI'
import TripGalleryUI from './newTripCompunents/TripGalleryUI'
import TripDurationUI from './newTripCompunents/TripDurationUI'
import TripDetailsUI from './newTripCompunents/TripDetailsUI'
import TripMapUI from './newTripCompunents/TripMapUI'
import VirtualTourUI from './newTripCompunents/VirtualTourUI'
import FinalPlanUI from './newTripCompunents/FinalPlanUI'
import WelcomeConsultationUI from './newTripCompunents/WelcomeConsultationUI'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ui?: string
}

const TripPlannerChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome to DreamTrip Adventures! I'm your personal AI travel consultant, and I'm thrilled to help you plan your perfect trip. Let's start by choosing the type of consultation that best fits your needs.",
      ui: 'welcome-consultation',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/aimodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      const data = await response.json()

      if (data.resp && data.ui !== undefined) {
        const newMessage = {
          role: 'assistant' as const,
          content: data.resp,
          ui: data.ui,
        }
        setMessages(prev => [...prev, newMessage])

        // Speak the AI response
        speakText(data.resp)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        ui: 'error',
      }
      setMessages(prev => [...prev, errorMessage])
      speakText(errorMessage.content)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleUISelection = async (selection: string, type: string) => {
    const selectionMessage: Message = {
      role: 'user',
      content: `I selected: ${selection} for ${type}`,
    }

    setMessages(prev => [...prev, selectionMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/aimodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, selectionMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      const data = await response.json()

      if (data.resp && data.ui !== undefined) {
        const newMessage = {
          role: 'assistant' as const,
          content: data.resp,
          ui: data.ui,
        }
        setMessages(prev => [...prev, newMessage])

        // Speak the AI response
        speakText(data.resp)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderUIComponent = (uiType: string) => {
    switch (uiType) {
      case 'welcome-consultation':
        return (
          <WelcomeConsultationUI
            onStartConsultation={type => handleUISelection(type, 'consultation type')}
          />
        )
      case 'budgeting':
        return (
          <BudgetingUI onBudgetSelect={(budget, label) => handleUISelection(label, 'budget')} />
        )
      case 'GroupSize':
        return (
          <GroupSizeUI onGroupSelect={(groupId, label) => handleUISelection(label, 'group size')} />
        )
      case 'hotels':
        return <HotelsUI />
      case 'trip-gallery':
        return <TripGalleryUI />
      case 'trip-duration':
        return (
          <TripDurationUI
            onDurationSelect={(duration, label) => handleUISelection(label, 'trip duration')}
          />
        )
      case 'trip-details':
        return (
          <TripDetailsUI
            onDetailsSelect={(interests, label) => handleUISelection(label, 'trip interests')}
          />
        )
      case 'trip-map':
        return <TripMapUI />
      case 'virtual-tour':
        return <VirtualTourUI />
      case 'final-plan':
        return <FinalPlanUI />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="bg-primary text-white p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">AI Trip Planner</h2>
            <p className="text-primary-foreground/80 text-sm">
              Let's plan your perfect trip together
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-[500px] sm:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {/* Message Bubble */}
            <div
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end animate-slideInRight' : 'justify-start animate-slideInLeft'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <p className="text-sm sm:text-base leading-relaxed flex-1">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 mt-1"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>

            {/* UI Component */}
            {message.role === 'assistant' && message.ui && (
              <div className="ml-0 sm:ml-11 mt-3">{renderUIComponent(message.ui)}</div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className="text-sm text-primary font-medium ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 sm:p-6 bg-gray-50">
        {/* Speech Control */}
        {isSpeaking && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">AI is speaking...</span>
            </div>
            <button
              onClick={stopSpeaking}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
              title="Stop speaking"
            >
              <VolumeX className="w-4 h-4 text-primary" />
            </button>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TripPlannerChat

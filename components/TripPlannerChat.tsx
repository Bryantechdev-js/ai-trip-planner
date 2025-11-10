'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Volume2, VolumeX, Mic, MicOff, Languages, Loader2 } from 'lucide-react'
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
  const [isListening, setIsListening] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage
      
      recognitionInstance.onstart = () => setIsListening(true)
      recognitionInstance.onend = () => setIsListening(false)
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => prev + transcript)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [currentLanguage])

  const speakText = async (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      let textToSpeak = text
      
      // Translate text if not in English
      if (currentLanguage !== 'en') {
        try {
          setIsTranslating(true)
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLanguage: currentLanguage })
          })
          const data = await response.json()
          if (data.translatedText) {
            textToSpeak = data.translatedText
          }
        } catch (error) {
          console.error('Translation error:', error)
        } finally {
          setIsTranslating(false)
        }
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage
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

  const translateMessage = async (text: string, targetLang: string) => {
    if (targetLang === 'en') return text
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: targetLang })
      })
      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    let messageContent = input
    
    // Translate user message to English if needed
    if (currentLanguage !== 'en') {
      setIsTranslating(true)
      messageContent = await translateMessage(input, 'en')
      setIsTranslating(false)
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/aimodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: messageContent }].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          language: currentLanguage,
        }),
      })

      const data = await response.json()

      if (data.resp && data.ui !== undefined) {
        let responseContent = data.resp
        
        // Translate AI response if needed
        if (currentLanguage !== 'en') {
          setIsTranslating(true)
          responseContent = await translateMessage(data.resp, currentLanguage)
          setIsTranslating(false)
        }
        
        const newMessage = {
          role: 'assistant' as const,
          content: responseContent,
          ui: data.ui,
        }
        setMessages(prev => [...prev, newMessage])

        // Speak the AI response
        speakText(responseContent)
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

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
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
          language: currentLanguage,
        }),
      })

      const data = await response.json()

      if (data.resp && data.ui !== undefined) {
        let responseContent = data.resp
        
        // Translate AI response if needed
        if (currentLanguage !== 'en') {
          setIsTranslating(true)
          responseContent = await translateMessage(data.resp, currentLanguage)
          setIsTranslating(false)
        }
        
        const newMessage = {
          role: 'assistant' as const,
          content: responseContent,
          ui: data.ui,
        }
        setMessages(prev => [...prev, newMessage])

        // Speak the AI response
        speakText(responseContent)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">AI Trip Planner</h2>
              <p className="text-primary-foreground/80 text-sm">
                Let's plan your perfect trip together
              </p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-gray-900">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
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
                      disabled={isSpeaking || isTranslating}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 mt-1 disabled:opacity-50"
                      title="Read aloud"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3 h-3 text-gray-600" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-gray-600" />
                      )}
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
        {/* Status Indicators */}
        {(isSpeaking || isListening || isTranslating) && (
          <div className="mb-4 space-y-2">
            {isSpeaking && (
              <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
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
            
            {isListening && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-sm text-green-700 font-medium">Listening... Speak now</span>
                </div>
                <button
                  onClick={stopListening}
                  className="p-1 hover:bg-green-200 rounded transition-colors"
                  title="Stop listening"
                >
                  <MicOff className="w-4 h-4 text-green-600" />
                </button>
              </div>
            )}
            
            {isTranslating && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700 font-medium">Translating...</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your message here... (${languages.find(l => l.code === currentLanguage)?.name})`}
              className="flex-1 min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base pr-12"
              disabled={isLoading || isListening}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !recognition}
              className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isTranslating}
            size="icon"
            className="h-11 w-11 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            {isLoading || isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TripPlannerChat

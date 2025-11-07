'use client'

import React, { useState, useEffect } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Loader, Send, Volume2, VolumeX, Bot } from 'lucide-react'
import EmptyBoxState from './EmptyBoxState'
import axios from 'axios'
import BudgetingUI from './BudgetingUI'
import GroupSizeUi from './GroupSizeUi'
import HotelsUI from './HotelsUI'
import TripGalleryUI from './TripGalleryUI'
import TripDurationUI from './TripDurationUI'
import TripDetailsUI from './TripDetailsUI'
import TripMapUI from './TripMapUI'
import VirtualTourUI from './VirtualTourUI'
import FinalPlanUI from './FinalPlanUI'
import WelcomeConsultationUI from './WelcomeConsultationUI'
import { useTripContext } from '@/contex/TripContext'
import { useUser } from '@clerk/nextjs'

function Chartbox() {
  const { updateTripData, tripData } = useTripContext()
  const [messages, setMessage] = useState<any>([
    {
      role: 'assistant',
      content:
        "Welcome to DreamTrip Adventures! I'm your personal AI travel consultant, and I'm absolutely thrilled to help you plan your next incredible journey!",
      ui: 'welcome-consultation',
    },
  ])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [userInput, setUserInput] = useState<any>('')
  const [isGenerating, setGenerating] = useState<boolean>(false)
  const [tripLimitReached, setTripLimitReached] = useState(false)
  const { user } = useUser()

  // Check trip limit on component mount
  useEffect(() => {
    const checkTripLimit = async () => {
      if (!user?.id) return

      try {
        const response = await fetch('/api/trip-limit', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 429) {
          setTripLimitReached(true)
          setMessage([
            {
              role: 'assistant',
              content:
                '🚫 Daily trip limit reached! Please upgrade your plan to generate unlimited trips or wait until tomorrow for your next free trip.',
              ui: '',
            },
          ])
          return
        }

        const data = await response.json()
        if (!data.canCreateTrip) {
          setTripLimitReached(true)
          setMessage([
            {
              role: 'assistant',
              content:
                '🚫 Daily trip limit reached! Please upgrade your plan to generate unlimited trips or wait until tomorrow for your next free trip.',
              ui: '',
            },
          ])
        }
      } catch (error) {
        console.error('Error checking trip limit:', error)
      }
    }

    checkTripLimit()
  }, [user?.id])
  const onSend = async () => {
    if (!userInput.trim() || tripLimitReached) return
    const currentInput = userInput
    setUserInput('')
    const newMsg = {
      role: 'user',
      content: currentInput,
    }
    setMessage((prev: any) => [...prev, newMsg])
    setGenerating(true)

    try {
      const result = await axios.post('/api/aimodel', {
        message: [...messages, newMsg],
        userId: user?.id || 'anonymous_user',
      })

      if (result?.data?.resp && result?.data?.ui !== undefined) {
        const newMessage = {
          role: 'assistant',
          content: result.data.resp,
          ui: result.data.ui,
        }
        setMessage((prev: any) => [...prev, newMessage])

        // Update trip context with any new data including live media
        if (
          result.data.destination ||
          result.data.source ||
          result.data.locationData ||
          result.data.liveMedia
        ) {
          updateTripData({
            ...(result.data.destination && { destination: result.data.destination }),
            ...(result.data.source && { sourceLocation: result.data.source }),
            ...(result.data.locationData && { locationData: result.data.locationData }),
            ...(result.data.liveMedia && { liveMedia: result.data.liveMedia }),
          })
        }

        // Speak the AI response
        speakText(result.data.resp)
      } else {
        const fallbackMessage = {
          role: 'assistant',
          content: 'I received your message. Let me help you with the next step.',
          ui: '',
        }
        setMessage((prev: any) => [...prev, fallbackMessage])
        speakText(fallbackMessage.content)
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const errorData = error.response?.data
        if (errorData?.upgradeRequired) {
          // Redirect to pricing page
          window.location.href = '/pricing?reason=limit_reached'
          return
        }
        setMessage((prev: any) => [
          ...prev,
          {
            role: 'assistant',
            content: '🚫 Daily trip limit reached! Redirecting to upgrade options...',
            ui: '',
          },
        ])
        setTimeout(() => {
          window.location.href = '/pricing?reason=limit_reached'
        }, 2000)
      } else {
        console.error('Error:', error)
        setMessage((prev: any) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            ui: '',
          },
        ])
      }
    } finally {
      setGenerating(false)
    }
  }

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

  const handleUISelection = async (selection: string, type: string) => {
    if (tripLimitReached) return

    const selectionMessage = {
      role: 'user',
      content: `I selected: ${selection} for ${type}`,
    }

    // Update trip context based on selection type
    switch (type) {
      case 'budget':
        updateTripData({ budget: selection })
        break
      case 'group size':
        updateTripData({ groupSize: selection })
        break
      case 'trip duration':
        // Extract numeric value from selection or use the selection directly if it's already a number
        const duration =
          typeof selection === 'number' ? selection : parseInt(selection.match(/\d+/)?.[0] || '0')
        console.log('Updating duration:', duration, 'from selection:', selection)
        updateTripData({ duration })
        break
      case 'trip interests':
        const interests = selection.split(', ')
        updateTripData({ interests })
        break
    }

    setMessage((prev: any) => [...prev, selectionMessage])
    setGenerating(true)

    try {
      const result = await axios.post('/api/aimodel', {
        message: [...messages, selectionMessage],
        userId: user?.id || 'anonymous_user',
      })

      if (result?.data?.resp && result?.data?.ui !== undefined) {
        const newMessage = {
          role: 'assistant',
          content: result.data.resp,
          ui: result.data.ui,
        }
        setMessage((prev: any) => [...prev, newMessage])

        // Update trip context with any new data from AI response
        if (result.data.destination || result.data.source || result.data.locationData) {
          updateTripData({
            ...(result.data.destination && { destination: result.data.destination }),
            ...(result.data.source && { sourceLocation: result.data.source }),
            ...(result.data.locationData && { locationData: result.data.locationData }),
          })
        }

        // Speak the AI response
        speakText(result.data.resp)
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const errorData = error.response?.data
        if (errorData?.upgradeRequired) {
          window.location.href = '/pricing?reason=limit_reached'
          return
        }
        setMessage((prev: any) => [
          ...prev,
          {
            role: 'assistant',
            content: '🚫 Daily trip limit reached! Redirecting to upgrade options...',
            ui: '',
          },
        ])
        setTimeout(() => {
          window.location.href = '/pricing?reason=limit_reached'
        }, 2000)
      } else {
        console.error('Error:', error)
        setMessage((prev: any) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            ui: '',
          },
        ])
      }
    } finally {
      setGenerating(false)
    }
  }

  const RenderGenerativeUI = (ui: string) => {
    switch (ui) {
      case 'welcome-consultation':
        return (
          <WelcomeConsultationUI
            onStartConsultation={type => handleUISelection(type, 'consultation type')}
          />
        )
      case 'budgeting':
      case 'budget':
        return (
          <BudgetingUI onBudgetSelect={(budget, label) => handleUISelection(label, 'budget')} />
        )
      case 'groupSize':
      case 'GroupSize':
        return (
          <GroupSizeUi onGroupSelect={(groupId, label) => handleUISelection(label, 'group size')} />
        )
      case 'hotels':
        return <HotelsUI onHotelSelect={(hotelId, label) => handleUISelection(label, 'hotel')} />
      case 'trip-gallery':
        return (
          <TripGalleryUI
            onContinue={() => handleUISelection('Continue to map', 'gallery viewed')}
          />
        )
      case 'trip-duration':
        return (
          <TripDurationUI
            onDurationSelect={(duration, label) => handleUISelection(label, 'trip duration')}
          />
        )
      case 'trip-details':
        return (
          <TripDetailsUI
            onDetailsSelect={(details, label) => handleUISelection(label, 'trip interests')}
          />
        )
      case 'trip-map':
        return (
          <TripMapUI
            source={tripData.sourceLocation}
            destination={tripData.destination}
            onContinue={() => handleUISelection('Continue to virtual tour', 'map viewed')}
          />
        )
      case 'virtual-tour':
        return (
          <VirtualTourUI
            onContinue={() => handleUISelection('Generate final plan', 'tour completed')}
          />
        )
      case 'final-plan':
        return <FinalPlanUI />
      case 'empty':
      case '':
        return null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn">
      <div className="flex-1 flex flex-col">
        {messages?.length <= 1 && <EmptyBoxState />}

        <section className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
          {messages.map((message: any, i: number) => {
            if (message?.role === 'system') return null

            return message?.role === 'user' ? (
              <div className="flex justify-end animate-slideInRight" key={i}>
                <div className="max-w-xs sm:max-w-lg bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
                  {message?.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start animate-slideInLeft" key={i}>
                <div className="max-w-full w-full">
                  {isGenerating && i === messages.length - 1 ? (
                    <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-primary font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {message?.content && (
                        <div className="bg-gray-100 px-4 py-2 rounded-lg text-black mb-4 relative">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              {message?.content?.includes('daily trip limit') ? (
                                <span className="text-red-500 font-medium">
                                  🚫 Daily limit reached! Please upgrade your plan or wait until
                                  tomorrow to generate another trip.
                                </span>
                              ) : (
                                message?.content
                              )}
                            </div>
                            <button
                              onClick={() => speakText(message.content)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                              title="Read aloud"
                            >
                              <Volume2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      {message?.ui && RenderGenerativeUI(message.ui)}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <section className="p-4 border-t bg-white">
        <div className="max-w-4xl mx-auto">
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

          <div className="border rounded-2xl p-4 relative">
            <Textarea
              placeholder={
                tripLimitReached
                  ? 'Trip limit reached. Please upgrade your plan.'
                  : 'Ask me about your trip plans...'
              }
              className="w-full h-20 border-transparent focus-visible:ring-0 shadow-none resize-none"
              onChange={e => setUserInput(e.target.value)}
              value={userInput}
              disabled={tripLimitReached}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !tripLimitReached) {
                  e.preventDefault()
                  onSend()
                }
              }}
            />
            <Button
              size={'icon'}
              className="absolute bottom-4 right-4 bg-primary text-white hover:bg-primary/80"
              onClick={onSend}
              disabled={isGenerating || !userInput.trim() || tripLimitReached}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Chartbox

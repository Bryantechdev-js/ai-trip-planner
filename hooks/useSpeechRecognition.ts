'use client'

import { useState, useEffect, useCallback } from 'react'
import { showError, showInfo } from '@/lib/toast'

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'
        
        recognitionInstance.onstart = () => {
          setIsListening(true)
          setError(null)
          showInfo('🎤 Listening... Speak now!')
        }
        
        recognitionInstance.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          setTranscript(finalTranscript + interimTranscript)
        }
        
        recognitionInstance.onend = () => {
          setIsListening(false)
        }
        
        recognitionInstance.onerror = (event) => {
          setError(event.error)
          setIsListening(false)
          
          let errorMessage = 'Speech recognition error occurred'
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.'
              break
            case 'audio-capture':
              errorMessage = 'Microphone not accessible. Please check permissions.'
              break
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please enable microphone access.'
              break
            case 'network':
              errorMessage = 'Network error occurred during speech recognition.'
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }
          
          showError('Speech Recognition Failed', errorMessage)
        }
        
        setRecognition(recognitionInstance)
      } else {
        setIsSupported(false)
        console.warn('Speech recognition not supported in this browser')
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('')
      setError(null)
      try {
        recognition.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        showError('Failed to start speech recognition', 'Please try again')
      }
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  }
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
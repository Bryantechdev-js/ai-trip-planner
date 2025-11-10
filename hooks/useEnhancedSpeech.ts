'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void
  addEventListener(type: 'start' | 'end', listener: () => void): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface UseEnhancedSpeechProps {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export const useEnhancedSpeech = ({
  onResult,
  onError,
  language = 'en-US',
  continuous = false,
  interimResults = true,
}: UseEnhancedSpeechProps = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = language

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          onResult?.(finalTranscript)
        }
        
        setInterimTranscript(interimTranscript)
      })

      recognition.addEventListener('start', () => {
        setIsListening(true)
        setError(null)
      })

      recognition.addEventListener('end', () => {
        setIsListening(false)
      })

      recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
        setError(event.error)
        setIsListening(false)
        onError?.(event.error)
      })
    }

    if (speechSynthesis) {
      synthRef.current = speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [language, continuous, interimResults, onResult, onError])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setInterimTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const speak = useCallback((text: string, options?: {
    lang?: string
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice
  }) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Apply options
    if (options?.lang) utterance.lang = options.lang
    if (options?.rate) utterance.rate = options.rate
    if (options?.pitch) utterance.pitch = options.pitch
    if (options?.volume) utterance.volume = options.volume
    if (options?.voice) utterance.voice = options.voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const getAvailableVoices = useCallback(() => {
    if (!synthRef.current) return []
    return synthRef.current.getVoices()
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    // Speech Recognition
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    
    // Text-to-Speech
    isSpeaking,
    speak,
    stopSpeaking,
    getAvailableVoices,
    
    // General
    isSupported,
    error,
  }
}
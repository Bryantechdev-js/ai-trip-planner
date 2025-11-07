'use client'

import React, { useState } from 'react'
import { Plane, MapPin, Calendar, Users, Star, Award, Globe, Heart } from 'lucide-react'
import { Button } from '../ui/button'

interface WelcomeConsultationUIProps {
  onStartConsultation?: (consultationType: string) => void
}

const WelcomeConsultationUI = ({ onStartConsultation }: WelcomeConsultationUIProps) => {
  const [selectedType, setSelectedType] = useState<string>('')

  const consultationTypes = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Planning',
      description: 'Full-service trip planning with detailed consultation',
      icon: <Award className="w-6 h-6" />,
      duration: '15-20 minutes',
      features: [
        'Personalized itinerary',
        'Accommodation booking',
        'Activity planning',
        'Travel insurance',
      ],
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      id: 'quick-getaway',
      title: 'Quick Getaway',
      description: 'Fast-track planning for spontaneous trips',
      icon: <Plane className="w-6 h-6" />,
      duration: '5-10 minutes',
      features: [
        'Essential planning',
        'Quick recommendations',
        'Basic itinerary',
        'Instant booking',
      ],
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      id: 'special-occasion',
      title: 'Special Occasion',
      description: 'Celebrating something special? Let us make it unforgettable',
      icon: <Heart className="w-6 h-6" />,
      duration: '20-25 minutes',
      features: [
        'Custom experiences',
        'Special arrangements',
        'Romantic settings',
        'Memory creation',
      ],
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    },
  ]

  const handleStartConsultation = (type: string) => {
    setSelectedType(type)
    if (onStartConsultation) {
      setTimeout(() => onStartConsultation(type), 1000)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome to DreamTrip Adventures! ✈️
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          I'm your personal travel consultant, and I'm absolutely thrilled to help you plan your
          next incredible journey! With over 15 years of experience creating unforgettable travel
          experiences, I'm here to make your dream trip a reality.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">5-Star Service</p>
        </div>
        <div className="text-center">
          <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">150+ Destinations</p>
        </div>
        <div className="text-center">
          <Users className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">10,000+ Happy Travelers</p>
        </div>
        <div className="text-center">
          <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">24/7 Support</p>
        </div>
      </div>

      {/* Consultation Types */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Let's choose the perfect consultation for you:
        </h3>

        <div className="grid gap-4 md:gap-6">
          {consultationTypes.map(type => (
            <div
              key={type.id}
              onClick={() => handleStartConsultation(type.id)}
              className={`p-5 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedType === type.id
                  ? 'border-primary bg-primary/5 shadow-lg transform scale-[1.02]'
                  : type.color
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type.icon}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 text-lg">{type.title}</h4>
                    <span className="text-primary font-medium text-sm bg-primary/10 px-2 py-1 rounded-full">
                      {type.duration}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{type.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedType === type.id ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                >
                  {selectedType === type.id && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      {selectedType && (
        <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-primary font-medium mb-4">
            🎉 Excellent choice! I'm excited to start planning your{' '}
            {consultationTypes.find(t => t.id === selectedType)?.title.toLowerCase()}.
          </p>
          <p className="text-gray-600 text-sm mb-4">
            I'll ask you some thoughtful questions to understand your travel dreams and preferences.
            This helps me create a personalized experience that's perfect for you!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>🔒 Your information is secure</span>
            <span>•</span>
            <span>💬 No pressure, just great advice</span>
            <span>•</span>
            <span>✨ Personalized recommendations</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WelcomeConsultationUI

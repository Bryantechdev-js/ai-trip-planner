'use client'

import React, { useState } from 'react'
import { MapPin, Calendar, Clock, Thermometer, Camera, Info, Heart, Star } from 'lucide-react'

interface TripDetailsUIProps {
  onDetailsSelect?: (interests: string[], label: string) => void
}

const TripDetailsUI = ({ onDetailsSelect }: TripDetailsUIProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const interestOptions = [
    {
      id: 'sightseeing',
      label: 'Sightseeing',
      icon: <Camera className="w-4 h-4" />,
      description: 'Famous landmarks and attractions',
    },
    {
      id: 'culture',
      label: 'Cultural Experiences',
      icon: <Star className="w-4 h-4" />,
      description: 'Museums, art, and local traditions',
    },
    {
      id: 'adventure',
      label: 'Adventure Activities',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Hiking, sports, and outdoor fun',
    },
    {
      id: 'food',
      label: 'Food & Dining',
      icon: <Heart className="w-4 h-4" />,
      description: 'Local cuisine and restaurants',
    },
    {
      id: 'nightlife',
      label: 'Nightlife',
      icon: <Clock className="w-4 h-4" />,
      description: 'Bars, clubs, and entertainment',
    },
    {
      id: 'shopping',
      label: 'Shopping',
      icon: <Info className="w-4 h-4" />,
      description: 'Markets, malls, and souvenirs',
    },
    {
      id: 'relaxation',
      label: 'Relaxation',
      icon: <Thermometer className="w-4 h-4" />,
      description: 'Spas, beaches, and peaceful spots',
    },
    {
      id: 'history',
      label: 'Historical Sites',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Ancient sites and monuments',
    },
  ]

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
      return newInterests
    })
  }

  const handleSubmitInterests = () => {
    if (selectedInterests.length > 0 && onDetailsSelect) {
      const selectedLabels = selectedInterests
        .map(id => interestOptions.find(opt => opt.id === id)?.label)
        .filter(Boolean)
      onDetailsSelect(selectedInterests, selectedLabels.join(', '))
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">What interests you?</h3>
          <p className="text-sm text-gray-600">
            Select your travel interests to personalize your trip
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {interestOptions.map(option => (
          <div
            key={option.id}
            onClick={() => handleInterestToggle(option.id)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedInterests.includes(option.id)
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedInterests.includes(option.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option.icon}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{option.label}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedInterests.includes(option.id)
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              >
                {selectedInterests.includes(option.id) && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedInterests.length > 0 && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary font-medium mb-2">
                ✓ Selected {selectedInterests.length} interest
                {selectedInterests.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map(id => {
                  const option = interestOptions.find(opt => opt.id === id)
                  return (
                    <span key={id} className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                      {option?.label}
                    </span>
                  )
                })}
              </div>
            </div>
            <button
              onClick={handleSubmitInterests}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDetailsUI

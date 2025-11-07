'use client'

import React, { useState } from 'react'
import { Calendar, Clock, Minus, Plus } from 'lucide-react'

interface TripDurationUIProps {
  onDurationSelect?: (duration: number, label: string) => void
}

const TripDurationUI = ({ onDurationSelect }: TripDurationUIProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(0)
  const [customDays, setCustomDays] = useState<number>(7)

  const durationOptions = [
    { days: 3, label: 'Weekend Getaway', description: 'Perfect for a quick escape' },
    { days: 7, label: 'One Week', description: 'Ideal for most destinations' },
    { days: 14, label: 'Two Weeks', description: 'Extended exploration' },
    { days: 21, label: 'Three Weeks', description: 'Deep cultural immersion' },
    { days: 30, label: 'One Month', description: 'Ultimate adventure' },
  ]

  const handleDurationSelect = (days: number, label: string) => {
    setSelectedDuration(days)
    setCustomDays(days)
    if (onDurationSelect) {
      setTimeout(() => onDurationSelect(days, `${days} days`), 500)
    }
  }

  const handleCustomDaysChange = (increment: boolean) => {
    if (increment && customDays < 365) {
      setCustomDays(prev => prev + 1)
    } else if (!increment && customDays > 1) {
      setCustomDays(prev => prev - 1)
    }
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Trip Duration</h3>
          <p className="text-sm text-gray-600">How long would you like to travel?</p>
        </div>
      </div>

      {/* Preset Duration Options */}
      <div className="grid gap-3 mb-6">
        {durationOptions.map(option => (
          <div
            key={option.days}
            onClick={() => handleDurationSelect(option.days, option.label)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedDuration === option.days
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedDuration === option.days
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-primary">{option.days}</div>
                <div className="text-xs text-gray-600">days</div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDuration === option.days ? 'border-primary bg-primary' : 'border-gray-300'
                }`}
              >
                {selectedDuration === option.days && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Duration Selector */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Custom Duration</h4>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleCustomDaysChange(false)}
            disabled={customDays <= 1}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{customDays}</div>
            <div className="text-sm text-gray-600">days</div>
          </div>

          <button
            onClick={() => handleCustomDaysChange(true)}
            disabled={customDays >= 365}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => handleDurationSelect(customDays, `${customDays} days`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Select {customDays} Days
          </button>
        </div>
      </div>

      {/* Duration Summary */}
      {selectedDuration && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">
              Selected Duration: {selectedDuration} days
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {selectedDuration <= 3 &&
              'Perfect for a quick getaway with highlights of your destination.'}
            {selectedDuration > 3 &&
              selectedDuration <= 7 &&
              'Great duration to explore main attractions and get a good feel for the place.'}
            {selectedDuration > 7 &&
              selectedDuration <= 14 &&
              'Excellent choice for deeper exploration and experiencing local culture.'}
            {selectedDuration > 14 &&
              'Amazing opportunity for comprehensive travel and authentic experiences.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default TripDurationUI

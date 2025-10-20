'use client'

import React, { useState } from 'react'
import { CheckCircle, MapPin, Calendar, Users, DollarSign, Plane, Hotel, Save, Share2 } from 'lucide-react'
import { useTripContext } from '@/contex/TripContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

const FinalPlanUI = () => {
  const { tripData } = useTripContext()
  const { user } = useUser()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const createTrip = useMutation(api.trips.createTrip)

  const handleSaveTrip = async () => {
    if (!user || !tripData.destination) return
    
    setIsSaving(true)
    try {
      // Check rate limit first
      const rateLimitResponse = await fetch('/api/trip-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const rateLimitData = await rateLimitResponse.json()
      
      if (!rateLimitResponse.ok) {
        if (rateLimitResponse.status === 429) {
          alert(`${rateLimitData.message}\n\nYour limit will reset at: ${new Date(rateLimitData.resetTime).toLocaleString()}`)
          return
        }
        throw new Error(rateLimitData.error || 'Rate limit check failed')
      }
      
      // Proceed with trip creation if rate limit allows
      const tripId = await createTrip({
        userId: user.id,
        destination: tripData.destination,
        sourceLocation: tripData.sourceLocation,
        groupSize: tripData.groupSize,
        budget: tripData.budget,
        duration: tripData.duration,
        interests: tripData.interests,
        tripPlan: tripData.locationData || {
          attractions: [],
          cuisine: [],
          culture: {
            languages: [],
            currency: '',
            timezone: '',
            tips: []
          },
          images: [],
          virtualTourData: {
            locations: []
          }
        },
        isPublic
      })
      setSavedTripId(tripId)
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Failed to save trip. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Your Complete Trip Plan</h3>
          <p className="text-sm text-gray-600">Everything is ready for your amazing journey!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trip Summary */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Trip Summary
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Destination</span>
              <span className="font-medium">{tripData.destination || 'Not specified'}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{tripData.duration || 0} Days</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Group Size</span>
              <span className="font-medium">{tripData.groupSize || 'Not specified'}</span>
            </div>
            <div className="flex justify-between p-3 bg-primary/5 rounded-lg">
              <span className="text-gray-600">Budget</span>
              <span className="font-bold text-primary">{tripData.budget || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Daily Itinerary
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[
              { day: 1, activity: "Arrival & Eiffel Tower" },
              { day: 2, activity: "Louvre Museum & Seine River" },
              { day: 3, activity: "Versailles Palace Day Trip" },
              { day: 4, activity: "Montmartre & Sacré-Cœur" },
              { day: 5, activity: "Champs-Élysées Shopping" },
              { day: 6, activity: "Notre-Dame & Latin Quarter" },
              { day: 7, activity: "Departure" }
            ].map((item) => (
              <div key={item.day} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {item.day}
                </div>
                <span className="text-sm text-gray-700">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Flight Details</span>
          </div>
          <p className="text-sm text-blue-700">Round trip flights included</p>
          <p className="text-xs text-blue-600">Departure: Dec 15 | Return: Dec 22</p>
        </div>

        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Hotel className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">Accommodation</span>
          </div>
          <p className="text-sm text-purple-700">4-star hotel in city center</p>
          <p className="text-xs text-purple-600">6 nights with breakfast included</p>
        </div>
      </div>

      {/* Save Trip Section */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="makePublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="makePublic" className="text-sm text-blue-800">
              Make this trip public for others to see
            </label>
          </div>
          <button
            onClick={handleSaveTrip}
            disabled={isSaving || !user || savedTripId}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : savedTripId ? 'Saved!' : 'Save Trip'}
          </button>
        </div>
        
        {savedTripId && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Trip Saved Successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your trip has been saved and {isPublic ? 'is now visible to other users' : 'is private'}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinalPlanUI
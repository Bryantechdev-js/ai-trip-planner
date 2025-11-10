'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Save,
  Share2,
  Star,
  Clock,
  Camera,
  Navigation,
  Sparkles,
  Heart,
  Download,
  ExternalLink,
} from 'lucide-react'
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
  const [destinationImage, setDestinationImage] = useState<string>('')
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(false)
  const createTrip = useMutation(api.trips.createTrip)

  useEffect(() => {
    if (tripData.destination) {
      fetchDestinationImage()
      setShowAnimation(true)
    }
  }, [tripData.destination])

  const fetchDestinationImage = async () => {
    setIsImageLoading(true)
    try {
      const response = await fetch('/api/media-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripData.destination,
          type: 'images',
        }),
      })

      const result = await response.json()
      if (result.data && result.data.length > 0) {
        // Get a high-quality image for the destination
        const bestImage =
          result.data.find((img: any) => img.source === 'Unsplash') || result.data[0]
        setDestinationImage(bestImage.url)
      } else {
        setDestinationImage(
          `https://source.unsplash.com/1200x800/?${encodeURIComponent(tripData.destination)},landmark,travel`
        )
      }
    } catch (error) {
      console.error('Error fetching destination image:', error)
      setDestinationImage(
        `https://source.unsplash.com/1200x800/?${encodeURIComponent(tripData.destination)},landmark,travel`
      )
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleSaveTrip = async () => {
    if (!user || !tripData.destination) return

    setIsSaving(true)
    try {
      // Check rate limit first
      const rateLimitResponse = await fetch('/api/trip-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const rateLimitData = await rateLimitResponse.json()

      if (!rateLimitResponse.ok) {
        if (rateLimitResponse.status === 429) {
          alert(
            `${rateLimitData.message}\n\nYour limit will reset at: ${new Date(rateLimitData.resetTime).toLocaleString()}`
          )
          return
        }
        throw new Error(rateLimitData.error || 'Rate limit check failed')
      }

      // Fetch real media content for the trip
      let galleryImages = []
      let videos = []

      try {
        // Fetch real images
        const imageResponse = await fetch('/api/media-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: tripData.destination,
            type: 'images',
          }),
        })

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json()
          if (imageResult.data && imageResult.data.length > 0) {
            galleryImages = imageResult.data.slice(0, 12).map((img: any) => ({
              url: img.url,
              thumbnail: img.thumb,
              title: img.title || `${tripData.destination} - ${img.category || 'Travel'}`,
              category: img.category || 'travel',
            }))
          }
        }

        // Fetch real videos
        const videoResponse = await fetch('/api/media-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: tripData.destination,
            type: 'videos',
          }),
        })

        if (videoResponse.ok) {
          const videoResult = await videoResponse.json()
          if (videoResult.data && videoResult.data.length > 0) {
            videos = videoResult.data.slice(0, 8).map((vid: any) => ({
              url: vid.url,
              thumbnail: vid.thumb,
              title: vid.title || `${tripData.destination} Video Tour`,
              duration: vid.duration ? `${vid.duration}s` : '15-30 min',
              type: vid.category || 'tour',
            }))
          }
        }
      } catch (mediaError) {
        console.error('Error fetching media:', mediaError)
      }

      // Fallback to generated content if no real media found
      if (galleryImages.length === 0) {
        const categories = ['landmarks', 'culture', 'food', 'nature', 'architecture', 'people']
        galleryImages = categories.map((category, index) => ({
          url: `https://source.unsplash.com/800x600/?${encodeURIComponent(tripData.destination)},${category},travel`,
          thumbnail: `https://source.unsplash.com/400x300/?${encodeURIComponent(tripData.destination)},${category}`,
          title: `${tripData.destination} - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          category,
        }))
      }

      if (videos.length === 0) {
        const videoTypes = ['tour', 'culture', 'food', 'attractions']
        videos = videoTypes.map((type, index) => ({
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(tripData.destination + ' ' + type + ' 4k')}`,
          thumbnail: `https://source.unsplash.com/640x360/?${encodeURIComponent(tripData.destination)},${type}`,
          title: `${tripData.destination} ${type.charAt(0).toUpperCase() + type.slice(1)} Experience`,
          duration: '15-30 min',
          type,
        }))
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
            tips: [],
          },
          images: [],
          virtualTourData: {
            locations: [],
          },
        },
        isPublic,
        coverImage:
          destinationImage ||
          (galleryImages.length > 0
            ? galleryImages[0].url
            : `https://source.unsplash.com/1200x800/?${encodeURIComponent(tripData.destination)},travel,landmark`),
        galleryImages,
        videos,
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
    <div
      className={`w-full max-w-6xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl transition-all duration-1000 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Hero Section with Destination Image */}
      <div className="relative h-80 overflow-hidden">
        {isImageLoading ? (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                <p className="text-lg font-medium">Loading destination preview...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={destinationImage}
              alt={`${tripData.destination} destination`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={e => {
                const target = e.target as HTMLImageElement
                target.src = `https://source.unsplash.com/1200x800/?${encodeURIComponent(tripData.destination)},landmark,travel`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        )}

        {/* Floating Elements */}
        <div className="absolute top-6 right-6 flex gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-bounce delay-300">
            <Heart className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Trip Title Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {tripData.destination
                    ? `Trip to ${tripData.destination}`
                    : 'Your Amazing Journey'}
                </h1>
                <p className="text-white/80 text-sm">Everything is ready for your adventure!</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-white/90">
              {tripData.duration > 0 && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{tripData.duration} days</span>
                </div>
              )}
              {tripData.groupSize && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{tripData.groupSize}</span>
                </div>
              )}
              {tripData.budget && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">{tripData.budget}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trip Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Trip Overview
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Destination</span>
                    <Navigation className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {tripData.destination || 'Not specified'}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Duration</span>
                    <Clock className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {tripData.duration > 0 ? `${tripData.duration} Days` : 'Not specified'}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Group Size</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {tripData.groupSize || 'Not specified'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 shadow-sm border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Budget</span>
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-lg font-bold text-yellow-700">
                    {tripData.budget || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Interests */}
              {tripData.interests.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Your Interests
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {tripData.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full border border-purple-200 font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Itinerary */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                Daily Itinerary (
                {tripData.duration && tripData.duration > 0
                  ? `${tripData.duration} Days`
                  : '7 Days'}
                )
              </h4>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {[
                  {
                    day: 1,
                    activity: `Arrival in ${tripData.destination}`,
                    icon: '✈️',
                    time: 'Morning',
                  },
                  { day: 2, activity: 'City Center Exploration', icon: '🏛️', time: 'Full Day' },
                  { day: 3, activity: 'Cultural Sites & Museums', icon: '🎨', time: 'Full Day' },
                  { day: 4, activity: 'Local Markets & Cuisine', icon: '🍽️', time: 'Full Day' },
                  { day: 5, activity: 'Adventure Activities', icon: '🎯', time: 'Full Day' },
                  { day: 6, activity: 'Relaxation & Shopping', icon: '🛍️', time: 'Full Day' },
                  { day: 7, activity: 'Departure', icon: '🎒', time: 'Morning' },
                ]
                  .slice(0, tripData.duration && tripData.duration > 0 ? tripData.duration : 7)
                  .map((item, index) => (
                    <div
                      key={item.day}
                      className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${index % 2 === 0 ? 'animate-fade-in-left' : 'animate-fade-in-right'}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                        {item.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-semibold text-gray-800">{item.activity}</span>
                        </div>
                        <span className="text-sm text-gray-500">{item.time}</span>
                      </div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Booking Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Booking Highlights
              </h5>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-blue-800">Flight Details</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-1">Round trip flights included</p>
                  <p className="text-xs text-blue-600">Departure: Dec 15 | Return: Dec 22</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-purple-800">Accommodation</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-1">4-star hotel in city center</p>
                  <p className="text-xs text-purple-600">
                    {(tripData.duration && tripData.duration > 0 ? tripData.duration : 7) - 1}{' '}
                    nights with breakfast
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Itinerary
              </button>

              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />
                View Full Details
              </button>
            </div>
          </div>
        </div>

        {/* Save Trip Section */}
        <div className="mt-8 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="makePublic"
                    checked={Boolean(isPublic)}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  {isPublic && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  )}
                </div>
                <label htmlFor="makePublic" className="text-sm font-medium text-indigo-800">
                  Make this trip public for others to discover
                </label>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <button
                  onClick={handleSaveTrip}
                  disabled={isSaving || !user || Boolean(savedTripId)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : savedTripId ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Trip
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {savedTripId && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 text-green-800 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Trip Saved Successfully!</span>
              </div>
              <p className="text-sm text-green-700">
                Your amazing trip to {tripData.destination} has been saved and{' '}
                {isPublic
                  ? 'is now visible to other travelers for inspiration'
                  : 'is kept private in your collection'}
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinalPlanUI

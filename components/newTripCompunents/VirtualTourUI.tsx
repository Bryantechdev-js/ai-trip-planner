'use client'

import React, { useState, useEffect } from 'react'
import { Eye, MapPin, Camera, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react'
import { useTripContext } from '@/contex/TripContext'

interface VirtualLocation {
  name: string
  description: string
  panoramaUrl: string
  streetViewUrl?: string
  coordinates?: { lat: number; lng: number }
}

interface VirtualTourUIProps {
  onContinue?: () => void
}

const VirtualTourUI = ({ onContinue }: VirtualTourUIProps) => {
  const { tripData } = useTripContext()
  const [currentLocation, setCurrentLocation] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [locations, setLocations] = useState<VirtualLocation[]>([])
  const [tourMode] = useState<'guided' | 'free'>('free')
  const [tourSteps] = useState<Array<{ id: string; name: string; description: string }>>([])
  const [currentStep, setCurrentStep] = useState(0)

  const generateStreetViewId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const getVirtualTourLocations = async (destination: string): Promise<VirtualLocation[]> => {
    try {
      // Get coordinates from our location API first
      const locationResponse = await fetch('/api/location-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      })

      let lat = 0,
        lng = 0

      if (locationResponse.ok) {
        const locationData = await locationResponse.json()
        if (locationData.coordinates) {
          lat = locationData.coordinates.lat
          lng = locationData.coordinates.lng
        }
      }

      // Fallback to Nominatim if no coordinates
      if (lat === 0 && lng === 0) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
        )
        const data = await response.json()

        if (data[0]) {
          lat = parseFloat(data[0].lat)
          lng = parseFloat(data[0].lon)
        }
      }

      if (lat !== 0 && lng !== 0) {
        return [
          {
            name: `${destination} City Center`,
            description: `Explore the heart of ${destination} with this immersive 360° view.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v${Date.now()}!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s${generateStreetViewId()}!2e0!7i16384!8i8192`,
            coordinates: { lat, lng },
          },
          {
            name: `${destination} Main Area`,
            description: `Discover the main attractions and local life of ${destination}.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v${Date.now() + 1}!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d${lat + 0.002}!2d${lng + 0.002}!3f90!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat + 0.002},${lng + 0.002},3a,75y,90h,90t/data=!3m6!1e1!3m4!1s${generateStreetViewId()}!2e0!7i16384!8i8192`,
            coordinates: { lat: lat + 0.002, lng: lng + 0.002 },
          },
          {
            name: `${destination} Landmarks`,
            description: `Visit the most famous landmarks and historic sites of ${destination}.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v${Date.now() + 2}!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d${lat - 0.002}!2d${lng - 0.002}!3f180!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat - 0.002},${lng - 0.002},3a,75y,180h,90t/data=!3m6!1e1!3m4!1s${generateStreetViewId()}!2e0!7i16384!8i8192`,
            coordinates: { lat: lat - 0.002, lng: lng - 0.002 },
          },
        ]
      }
    } catch (error) {
      console.error('Error generating virtual tour:', error)
    }

    // Enhanced fallback with better Street View integration
    return [
      {
        name: `${destination} Virtual Tour`,
        description: `Experience ${destination} through immersive 360° street views and explore the city virtually.`,
        panoramaUrl: `https://www.google.com/maps/embed?pb=!4v${Date.now()}!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d0!2d0!3f0!4f0!5f0.7820865974627469`,
        streetViewUrl: `https://www.google.com/maps/search/${encodeURIComponent(destination)}/@?api=1&map_action=pano`,
      },
    ]
  }

  useEffect(() => {
    // Generate virtual tour locations based on destination
    const generateVirtualTour = async () => {
      if (!tripData.destination) return

      const virtualLocations = await getVirtualTourLocations(tripData.destination)
      setLocations(virtualLocations)
    }

    generateVirtualTour()
  }, [tripData.destination])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Auto-advance through locations
      const interval = setInterval(() => {
        setCurrentLocation(prev => (prev + 1) % locations.length)
      }, 5000)

      setTimeout(() => {
        clearInterval(interval)
        setIsPlaying(false)
      }, locations.length * 5000)
    }
  }

  const openFullscreen = () => {
    if (
      locations[currentLocation]?.streetViewUrl &&
      locations[currentLocation].streetViewUrl !== '#'
    ) {
      window.open(locations[currentLocation].streetViewUrl, '_blank')
    } else {
      // Enhanced Google Maps Street View URL
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(tripData.destination)}/@?api=1&map_action=pano&viewpoint=${locations[currentLocation]?.coordinates?.lat || 0},${locations[currentLocation]?.coordinates?.lng || 0}`
      window.open(searchUrl, '_blank')
    }
  }

  const openYouTubeVirtualTour = () => {
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(tripData.destination + ' virtual tour 4k walking tour')}`
    window.open(youtubeUrl, '_blank')
  }

  if (!tripData.destination) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Virtual tour will be available once you select a destination
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Eye className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">360° Virtual Tour</h3>
          <p className="text-sm text-gray-600">Explore {tripData.destination} before you go</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Main 360 Viewer */}
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden relative">
            {locations.length > 0 ? (
              <div className="relative w-full h-full">
                <iframe
                  src={locations[currentLocation]?.panoramaUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Virtual tour of ${locations[currentLocation]?.name}`}
                  className="rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  360° View
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-600 font-medium">Loading virtual tour...</p>
                  <p className="text-purple-500 text-sm mt-1">Preparing 360° experience</p>
                </div>
              </div>
            )}

            {/* Control Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={togglePlayPause}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Play className="w-4 h-4 text-purple-600" />
                  )}
                </button>
                <button
                  onClick={() => setCurrentLocation(0)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={openFullscreen}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                  title="Open in Google Street View"
                >
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                </button>
                <button
                  onClick={openYouTubeVirtualTour}
                  className="p-2 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Watch YouTube Virtual Tour"
                >
                  <Play className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {locations.map((location, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentLocation(idx)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  idx === currentLocation
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tour Information */}
        <div className="space-y-4">
          {locations.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Current Location</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {locations[currentLocation]?.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {locations[currentLocation]?.description}
              </p>
              {locations[currentLocation]?.coordinates && (
                <div className="flex items-center gap-4 text-xs text-purple-600">
                  <span>
                    📍 {locations[currentLocation].coordinates.lat.toFixed(4)},{' '}
                    {locations[currentLocation].coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Tour Locations</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {locations.map((location, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentLocation(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    idx === currentLocation
                      ? 'bg-purple-100 border border-purple-200 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        idx === currentLocation
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        {location.name}
                      </span>
                      <span className="text-xs text-gray-500">360° Street View</span>
                    </div>
                  </div>
                  {idx === currentLocation && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-blue-800">Virtual Tour Features</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Real Google Street View integration</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>360° panoramic exploration</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>YouTube virtual tours available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Multiple viewpoints per destination</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold text-red-800">Video Tours</span>
                </div>
                <button
                  onClick={openYouTubeVirtualTour}
                  className="px-3 py-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors"
                >
                  Watch Now
                </button>
              </div>
              <p className="text-sm text-red-700">
                Experience {tripData.destination} through immersive 4K walking tours and drone
                footage on YouTube.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Progress Bar (for guided mode) */}
      {tourMode === 'guided' && tourSteps.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tour Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Previous Step
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(tourSteps.length - 1, currentStep + 1))}
              disabled={currentStep === tourSteps.length - 1}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Generate Final Trip Plan
        </button>
      </div>
    </div>
  )
}

export default VirtualTourUI

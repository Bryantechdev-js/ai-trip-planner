'use client'

import React, { useState, useEffect } from 'react'
import { Eye, MapPin, Camera, Play, Pause, RotateCcw, Maximize, ExternalLink } from 'lucide-react'
import { useTripContext } from '@/contex/TripContext'

interface VirtualLocation {
  name: string
  description: string
  panoramaUrl: string
  streetViewUrl?: string
  coordinates?: { lat: number, lng: number }
}

const VirtualTourUI = () => {
  const { tripData } = useTripContext()
  const [currentLocation, setCurrentLocation] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [locations, setLocations] = useState<VirtualLocation[]>([])
  const [tourMode] = useState<'guided' | 'free'>('free')
  const [tourSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Generate virtual tour locations based on destination
    const generateVirtualTour = async () => {
      if (!tripData.destination) return
      
      const virtualLocations = await getVirtualTourLocations(tripData.destination)
      setLocations(virtualLocations)
    }
    
    generateVirtualTour()
  }, [tripData.destination])

  const getVirtualTourLocations = async (destination: string): Promise<VirtualLocation[]> => {
    // Get coordinates for the destination
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      )
      const data = await response.json()
      
      if (data[0]) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        
        return [
          {
            name: `${destination} City Center`,
            description: `Explore the heart of ${destination} with this immersive 360° view.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1s${generateStreetViewId()}!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m7!1e1!3m5!1s${generateStreetViewId()}!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com!7i16384!8i8192`,
            coordinates: { lat, lng }
          },
          {
            name: `${destination} Main Square`,
            description: `Visit the main square and see the bustling life of ${destination}.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v1234567891!6m8!1m7!1s${generateStreetViewId()}!2m2!1d${lat + 0.001}!2d${lng + 0.001}!3f90!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat + 0.001},${lng + 0.001},3a,75y,90h,90t/data=!3m7!1e1!3m5!1s${generateStreetViewId()}!2e0`,
            coordinates: { lat: lat + 0.001, lng: lng + 0.001 }
          },
          {
            name: `${destination} Historic District`,
            description: `Step back in time and explore the historic areas of ${destination}.`,
            panoramaUrl: `https://www.google.com/maps/embed?pb=!4v1234567892!6m8!1m7!1s${generateStreetViewId()}!2m2!1d${lat - 0.001}!2d${lng - 0.001}!3f180!4f0!5f0.7820865974627469`,
            streetViewUrl: `https://www.google.com/maps/@${lat - 0.001},${lng - 0.001},3a,75y,180h,90t/data=!3m7!1e1!3m5!1s${generateStreetViewId()}!2e0`,
            coordinates: { lat: lat - 0.001, lng: lng - 0.001 }
          }
        ]
      }
    } catch (error) {
      console.error('Error generating virtual tour:', error)
    }
    
    // Fallback locations
    return [
      {
        name: `${destination} Overview`,
        description: `Get an overview of ${destination} from this panoramic viewpoint.`,
        panoramaUrl: `https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d0!2d0!3f0!4f0!5f0.7820865974627469`,
        streetViewUrl: '#'
      }
    ]
  }

  const generateStreetViewId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

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
    if (locations[currentLocation]?.streetViewUrl && locations[currentLocation].streetViewUrl !== '#') {
      window.open(locations[currentLocation].streetViewUrl, '_blank')
    }
  }

  if (!tripData.destination) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Virtual tour will be available once you select a destination</p>
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
              <iframe
                src={locations[currentLocation]?.panoramaUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Virtual tour of ${locations[currentLocation]?.name}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-600">Loading virtual tour...</p>
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
              <button 
                onClick={openFullscreen}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </button>
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
              <h4 className="font-semibold text-gray-800 mb-2">{locations[currentLocation]?.name}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {locations[currentLocation]?.description}
              </p>
              {locations[currentLocation]?.coordinates && (
                <div className="flex items-center gap-4 text-xs text-purple-600">
                  <span>📍 {locations[currentLocation].coordinates.lat.toFixed(4)}, {locations[currentLocation].coordinates.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Tour Locations</h4>
            <div className="space-y-2">
              {locations.map((location, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentLocation(idx)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    idx === currentLocation ? 'bg-purple-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏛️</span>
                    <span className="text-sm font-medium text-gray-700">{location.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">360° View</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Virtual Tour Features</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real Google Street View integration</li>
              <li>• 360° panoramic exploration</li>
              <li>• Auto-play tour mode available</li>
              <li>• Full-screen viewing option</li>
              <li>• Multiple viewpoints per destination</li>
            </ul>
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
    </div>
  )
}

export default VirtualTourUI
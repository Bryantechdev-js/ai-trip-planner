'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Navigation, Clock, Route, AlertCircle, Satellite, Car } from 'lucide-react'
import {
  calculateDistance,
  estimateTravelTime,
  formatDuration,
  getRouteType,
  type Coordinates,
} from '@/lib/mapUtils'

interface TripMapUIProps {
  source?: string
  destination?: string
  onContinue?: () => void
}

interface RouteData {
  distance: number
  duration: number
  coordinates: [number, number][]
  type: 'flight' | 'ground'
}

const TripMapUI = ({ source, destination, onContinue }: TripMapUIProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [viewMode, setViewMode] = useState<'street' | 'satellite'>('street')
  const [loading, setLoading] = useState(true)

  const getCoordinates = useCallback(async (location: string): Promise<[number, number] | null> => {
    if (!location || location.trim() === '') return null

    try {
      // First try our location data API for better results
      const locationResponse = await fetch('/api/location-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      })

      if (locationResponse.ok) {
        const locationData = await locationResponse.json()
        if (locationData.coordinates) {
          return [locationData.coordinates.lat, locationData.coordinates.lng]
        }
      }

      // Fallback to Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
        { headers: { 'User-Agent': 'TripPlanner/1.0' } }
      )

      if (!response.ok) throw new Error('Geocoding service unavailable')

      const data = await response.json()
      if (data[0]) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    return null
  }, [])

  useEffect(() => {
    let mounted = true

    const loadLeaflet = async () => {
      try {
        setLoading(true)
        setMapError(null)

        if (typeof window === 'undefined' || !mapRef.current) return

        // Clean up existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Clear the map container
        if (mapRef.current) {
          mapRef.current.innerHTML = ''
          // Clear leaflet id if it exists
          const container = mapRef.current as any
          if (container._leaflet_id) {
            delete container._leaflet_id
          }
        }

        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')

        // Fix default markers
        delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Check if container is already initialized
        const container = mapRef.current as any
        if (container._leaflet_id) {
          return
        }

        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
        }).setView([40.7128, -74.006], 2)

        mapInstanceRef.current = map

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map)

        // Get coordinates for both locations
        const [sourceCoords, destCoords] = await Promise.all([
          getCoordinates(source),
          getCoordinates(destination),
        ])

        if (!mounted) return

        if (sourceCoords && destCoords) {
          // Add custom markers
          L.marker(sourceCoords, {
            title: source,
          })
            .addTo(map)
            .bindPopup(`<b>Start:</b> ${source}`)

          L.marker(destCoords, {
            title: destination,
          })
            .addTo(map)
            .bindPopup(`<b>Destination:</b> ${destination}`)

          // Draw route line
          L.polyline([sourceCoords, destCoords], {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5',
          }).addTo(map)

          // Calculate route data
          const distance = calculateDistance(
            { lat: sourceCoords[0], lng: sourceCoords[1] },
            { lat: destCoords[0], lng: destCoords[1] }
          )
          const duration = estimateTravelTime(distance)
          const routeType = getRouteType(distance)

          setRouteData({
            distance: Math.round(distance),
            duration: Math.round(duration * 10) / 10,
            coordinates: [sourceCoords, destCoords],
            type: routeType,
          })

          // Fit map to show both points
          map.fitBounds([sourceCoords, destCoords], { padding: [20, 20] })
        } else {
          throw new Error('Could not find coordinates for the specified locations')
        }

        if (mounted) {
          setMapLoaded(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Map loading error:', error)
        if (mounted) {
          setMapError(error instanceof Error ? error.message : 'Failed to load map')
          setLoading(false)
        }
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [source, destination, getCoordinates])

  const toggleViewMode = useCallback(async () => {
    if (!mapInstanceRef.current) return

    const L = (await import('leaflet')).default
    const map = mapInstanceRef.current

    // Remove existing tile layers
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Add new tile layer based on view mode
    const newMode = viewMode === 'street' ? 'satellite' : 'street'
    const tileUrl =
      newMode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    L.tileLayer(tileUrl, {
      attribution: newMode === 'satellite' ? '© Esri' : '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    setViewMode(newMode)
  }, [viewMode])

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-3 sm:p-6 animate-slideInUp">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
            Live Route Map
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Interactive route from {source} to {destination}
          </p>
        </div>
      </div>

      <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden relative">
        {(loading || !mapLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
            <div className="text-center">
              <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm sm:text-base text-primary font-medium">
                {loading ? 'Loading interactive map...' : 'Initializing map...'}
              </p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-50">
            <div className="text-center p-4">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">Map Error</p>
              <p className="text-xs text-red-500 mt-1">{mapError}</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full rounded-xl" />

        {mapLoaded && !mapError && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 z-20 shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Navigation className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
              <span className="font-medium">
                {source} → {destination}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
        <button
          onClick={toggleViewMode}
          disabled={!mapLoaded || !!mapError}
          className="px-2 sm:px-3 py-1 bg-primary text-white rounded-full text-xs sm:text-sm hover:bg-primary/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Satellite className="w-3 h-3" />
          {viewMode === 'street' ? 'Satellite' : 'Street'} View
        </button>
        <button
          disabled={!mapLoaded || !!mapError}
          className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-gray-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Car className="w-3 h-3" />
          Route Details
        </button>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
            <span className="font-medium text-blue-800 text-xs sm:text-sm">Travel Time</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            {routeData ? formatDuration(routeData.duration) : '--'}
          </p>
          <p className="text-xs text-blue-600">Estimated</p>
        </div>

        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" />
            <span className="font-medium text-green-800 text-xs sm:text-sm">Distance</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {routeData ? `${routeData.distance.toLocaleString()} km` : '--'}
          </p>
          <p className="text-xs text-green-600">Direct</p>
        </div>

        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-3 sm:w-4 h-3 sm:h-4 text-orange-600" />
            <span className="font-medium text-orange-800 text-xs sm:text-sm">Route Type</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-orange-600 capitalize">
            {routeData ? routeData.type : '--'}
          </p>
          <p className="text-xs text-orange-600">Optimal</p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Continue to Virtual Tour
        </button>
      </div>
    </div>
  )
}

export default TripMapUI

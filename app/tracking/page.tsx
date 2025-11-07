'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Phone,
  Shield,
  Users,
  Camera,
  Wifi,
  Smartphone,
  Navigation,
  AlertTriangle,
  Battery,
  Signal,
  Eye,
  EyeOff,
  Share2,
  Bell,
  Clock,
  Route,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
  speed?: number
  heading?: number
}

interface TrackingSettings {
  shareLocation: boolean
  emergencyMode: boolean
  recordVideo: boolean
  trackWifi: boolean
  trackSim: boolean
  trackIP: boolean
  stealthMode: boolean
  updateInterval: number
}

const TrackingPage = () => {
  const { user } = useUser()
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([])
  const [settings, setSettings] = useState<TrackingSettings>({
    shareLocation: true,
    emergencyMode: false,
    recordVideo: false,
    trackWifi: true,
    trackSim: true,
    trackIP: true,
    stealthMode: false,
    updateInterval: 30000,
  })
  const [batteryLevel, setBatteryLevel] = useState<number>(100)
  const [networkInfo, setNetworkInfo] = useState<any>({})
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (user) {
      getBatteryInfo()
      getNetworkInfo()
    }
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [user])

  const getBatteryInfo = async () => {
    try {
      // @ts-ignore
      const battery = await navigator.getBattery?.()
      if (battery) {
        setBatteryLevel(Math.round(battery.level * 100))
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      }
    } catch (error) {
      console.log('Battery API not supported')
    }
  }

  const getNetworkInfo = () => {
    try {
      // @ts-ignore
      const connection =
        navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        setNetworkInfo({
          type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        })
      }
    } catch (error) {
      console.log('Network Information API not supported')
    }
  }

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        }

        setCurrentLocation(locationData)

        if (settings.stealthMode || settings.shareLocation) {
          sendLocationUpdate(locationData)
        }
      },
      error => {
        console.error('Geolocation error:', error)
        if (settings.trackWifi || settings.trackIP) {
          getLocationByIP()
        }
      },
      options
    )
  }

  const getLocationByIP = async () => {
    try {
      const response = await fetch('/api/tracking/ip-location')
      const data = await response.json()
      if (data.latitude && data.longitude) {
        const locationData: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 10000,
          timestamp: Date.now(),
          address: data.city + ', ' + data.country,
        }
        setCurrentLocation(locationData)
        sendLocationUpdate(locationData)
      }
    } catch (error) {
      console.error('IP location failed:', error)
    }
  }

  const sendLocationUpdate = async (location: LocationData) => {
    try {
      await fetch('/api/tracking/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          location,
          batteryLevel,
          networkInfo,
          settings,
        }),
      })
    } catch (error) {
      console.error('Failed to send location update:', error)
    }
  }

  const startTracking = async () => {
    if (!user) return
    setIsTracking(true)
    startLocationTracking()

    if (settings.recordVideo) {
      startVideoRecording()
    }
  }

  const stopTracking = async () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (isRecording) {
      stopVideoRecording()
    }

    setIsTracking(false)
    setCurrentLocation(null)
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start video recording:', error)
    }
  }

  const stopVideoRecording = () => {
    setIsRecording(false)
  }

  const triggerEmergency = async () => {
    if (!currentLocation) return

    try {
      await fetch('/api/tracking/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          location: currentLocation,
          emergencyContacts,
          batteryLevel,
          networkInfo,
        }),
      })

      alert('Emergency alert sent to your contacts!')
    } catch (error) {
      console.error('Failed to send emergency alert:', error)
    }
  }

  const shareLocation = async () => {
    if (!currentLocation) return

    const shareData = {
      title: 'My Current Location',
      text: `I'm currently at: ${currentLocation.latitude}, ${currentLocation.longitude}`,
      url: `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert('Location link copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share location:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Tracking & Safety</h1>
          <p className="text-gray-600">Real-time location tracking with advanced safety features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold ${isTracking ? 'text-green-600' : 'text-gray-400'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <MapPin className={`w-8 h-8 ${isTracking ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Battery</p>
                  <p
                    className={`font-semibold ${batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {batteryLevel}%
                  </p>
                </div>
                <Battery
                  className={`w-8 h-8 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="font-semibold text-blue-600">{networkInfo.type || 'Unknown'}</p>
                </div>
                <Signal className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recording</p>
                  <p className={`font-semibold ${isRecording ? 'text-red-600' : 'text-gray-400'}`}>
                    {isRecording ? 'ON' : 'OFF'}
                  </p>
                </div>
                <Camera className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Live Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  {currentLocation ? (
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="font-semibold">
                        Location: {currentLocation.latitude.toFixed(6)},{' '}
                        {currentLocation.longitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Accuracy: ±{Math.round(currentLocation.accuracy)}m
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`,
                            '_blank'
                          )
                        }
                      >
                        View on Google Maps
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Location not available</p>
                      <p className="text-sm">Start tracking to see your location</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                  </Button>

                  <Button
                    onClick={triggerEmergency}
                    variant="destructive"
                    disabled={!currentLocation}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency
                  </Button>

                  <Button onClick={shareLocation} variant="outline" disabled={!currentLocation}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Location
                  </Button>

                  <Button
                    onClick={() =>
                      setSettings(prev => ({ ...prev, recordVideo: !prev.recordVideo }))
                    }
                    variant="outline"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {settings.recordVideo ? 'Stop Video' : 'Start Video'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Share Location</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSettings(prev => ({ ...prev, shareLocation: !prev.shareLocation }))
                    }
                  >
                    {settings.shareLocation ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Stealth Mode</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSettings(prev => ({ ...prev, stealthMode: !prev.stealthMode }))
                    }
                  >
                    {settings.stealthMode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Track WiFi</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, trackWifi: !prev.trackWifi }))}
                  >
                    <Wifi
                      className={`w-4 h-4 ${settings.trackWifi ? 'text-green-500' : 'text-gray-400'}`}
                    />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Track SIM</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, trackSim: !prev.trackSim }))}
                  >
                    <Smartphone
                      className={`w-4 h-4 ${settings.trackSim ? 'text-green-500' : 'text-gray-400'}`}
                    />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Track IP</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, trackIP: !prev.trackIP }))}
                  >
                    <Navigation
                      className={`w-4 h-4 ${settings.trackIP ? 'text-green-500' : 'text-gray-400'}`}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emergencyContacts.length === 0 ? (
                    <p className="text-sm text-gray-500">No emergency contacts added</p>
                  ) : (
                    emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{contact}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEmergencyContacts(prev => prev.filter((_, i) => i !== index))
                          }
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const contact = prompt('Enter emergency contact (phone or email):')
                      if (contact) {
                        setEmergencyContacts(prev => [...prev, contact])
                      }
                    }}
                  >
                    Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {currentLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span>{' '}
                    {currentLocation.latitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span>{' '}
                    {currentLocation.longitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Accuracy:</span> ±
                    {Math.round(currentLocation.accuracy)}m
                  </div>
                  {currentLocation.speed && (
                    <div>
                      <span className="font-medium">Speed:</span>{' '}
                      {Math.round(currentLocation.speed * 3.6)} km/h
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Last Update:</span>{' '}
                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {settings.recordVideo && <video ref={videoRef} autoPlay muted className="hidden" />}
      </div>
    </div>
  )
}

export default TrackingPage

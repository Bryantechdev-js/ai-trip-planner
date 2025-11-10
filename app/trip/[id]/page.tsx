'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Clock,
  Camera,
  Play,
  Download,
  Share2,
  ArrowLeft,
  Star,
  Navigation,
  Plane,
  Hotel,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TripDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const TripDetailPage = ({ params }: TripDetailPageProps) => {
  const [tripId, setTripId] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    params.then(p => setTripId(p.id))
  }, [params])
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'videos' | 'itinerary'>(
    'overview'
  )

  const trip = useQuery(api.trips.getTripById, tripId ? {
    tripId: tripId as Id<'TripTable'>,
  } : 'skip')

  if (!tripId || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  const handleDownloadItinerary = () => {
    const itineraryData = {
      destination: trip.destination,
      sourceLocation: trip.sourceLocation,
      duration: trip.duration,
      groupSize: trip.groupSize,
      budget: trip.budget,
      interests: trip.interests,
      attractions: trip.tripPlan.attractions,
      cuisine: trip.tripPlan.cuisine,
      culture: trip.tripPlan.culture,
      createdAt: new Date(trip.createdAt).toLocaleDateString(),
    }

    const content = `
TRIP ITINERARY
==============

Destination: ${itineraryData.destination}
From: ${itineraryData.sourceLocation}
Duration: ${itineraryData.duration} days
Group Size: ${itineraryData.groupSize}
Budget: ${itineraryData.budget}
Created: ${itineraryData.createdAt}

INTERESTS
---------
${itineraryData.interests.join(', ')}

TOP ATTRACTIONS
---------------
${itineraryData.attractions.map((attraction, i) => `${i + 1}. ${attraction}`).join('\n')}

LOCAL CUISINE
-------------
${itineraryData.cuisine.map((dish, i) => `${i + 1}. ${dish}`).join('\n')}

CULTURAL INFORMATION
--------------------
Languages: ${itineraryData.culture.languages.join(', ')}
Currency: ${itineraryData.culture.currency}
Timezone: ${itineraryData.culture.timezone}

TRAVEL TIPS
-----------
${itineraryData.culture.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip.destination.replace(/\s+/g, '-').toLowerCase()}-itinerary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareTrip = async () => {
    const shareData = {
      title: `Trip to ${trip.destination}`,
      text: `Check out this amazing ${trip.duration}-day trip to ${trip.destination}!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Trip link copied to clipboard!')
    }
  }

  const nextImage = () => {
    if (trip.galleryImages) {
      setSelectedImageIndex(prev => (prev + 1) % trip.galleryImages!.length)
    }
  }

  const prevImage = () => {
    if (trip.galleryImages) {
      setSelectedImageIndex(
        prev => (prev - 1 + trip.galleryImages!.length) % trip.galleryImages!.length
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={
            trip.coverImage ||
            `https://source.unsplash.com/1200x800/?${encodeURIComponent(trip.destination)},travel,landmark`
          }
          alt={`${trip.destination} cover`}
          className="w-full h-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src = `https://source.unsplash.com/1200x800/?${encodeURIComponent(trip.destination)},travel,landmark`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Trip Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {trip.destination}
                </h1>
                <p className="text-white/80 text-lg">
                  From {trip.sourceLocation} • {trip.duration} days
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadItinerary}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={shareTrip}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: MapPin },
            { id: 'gallery', label: 'Gallery', icon: Camera },
            { id: 'videos', label: 'Videos', icon: Play },
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Duration</p>
                        <p className="text-blue-700">{trip.duration} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Group Size</p>
                        <p className="text-green-700">{trip.groupSize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Budget</p>
                        <p className="text-yellow-700">{trip.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Status</p>
                        <p className="text-purple-700 capitalize">{trip.status || 'planned'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              {trip.interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trip.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attractions */}
              {trip.tripPlan.attractions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Attractions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {trip.tripPlan.attractions.map((attraction, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <span className="text-gray-800">{attraction}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Cultural Info */}
              {trip.tripPlan.culture && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trip.tripPlan.culture.currency && (
                      <div>
                        <p className="font-medium text-gray-700">Currency</p>
                        <p className="text-gray-600">{trip.tripPlan.culture.currency}</p>
                      </div>
                    )}
                    {trip.tripPlan.culture.timezone && (
                      <div>
                        <p className="font-medium text-gray-700">Timezone</p>
                        <p className="text-gray-600">{trip.tripPlan.culture.timezone}</p>
                      </div>
                    )}
                    {trip.tripPlan.culture.languages.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700">Languages</p>
                        <p className="text-gray-600">
                          {trip.tripPlan.culture.languages.join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => setActiveTab('gallery')}>
                    <Camera className="w-4 h-4 mr-2" />
                    View Gallery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('videos')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Videos
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleDownloadItinerary}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Itinerary
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {trip.galleryImages && trip.galleryImages.length > 0 ? (
              <>
                {/* Main Image Display */}
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative group">
                    <img
                      src={trip.galleryImages[selectedImageIndex]?.url}
                      alt={trip.galleryImages[selectedImageIndex]?.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://source.unsplash.com/1200x800/?${encodeURIComponent(trip.destination)},travel`
                      }}
                    />

                    {/* Navigation Arrows */}
                    {trip.galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Zoom Button */}
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {trip.galleryImages[selectedImageIndex]?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedImageIndex + 1} of {trip.galleryImages.length} images
                    </p>
                  </div>
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {trip.galleryImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image.thumbnail}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://source.unsplash.com/400x400/?${encodeURIComponent(trip.destination)},${image.category}`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No gallery images available
                </h3>
                <p className="text-gray-500">Images will be added when available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            {trip.videos && trip.videos.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {trip.videos.map((video, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative aspect-video bg-gray-200">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://source.unsplash.com/640x360/?${encodeURIComponent(trip.destination)},${video.type}`
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{video.duration}</span>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Watch <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No videos available</h3>
                <p className="text-gray-500">Videos will be added when available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: trip.duration }, (_, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Day {index + 1}:{' '}
                          {index === 0
                            ? `Arrival in ${trip.destination}`
                            : index === trip.duration - 1
                              ? 'Departure'
                              : `Explore ${trip.destination}`}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {index === 0
                            ? 'Arrive and settle in, explore nearby areas'
                            : index === trip.duration - 1
                              ? 'Final activities and departure preparations'
                              : 'Full day of sightseeing and cultural experiences'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && trip.galleryImages && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl"
            >
              ✕
            </button>
            <img
              src={trip.galleryImages[selectedImageIndex]?.url}
              alt={trip.galleryImages[selectedImageIndex]?.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onError={e => {
                const target = e.target as HTMLImageElement
                target.src = `https://source.unsplash.com/1200x800/?${encodeURIComponent(trip.destination)},travel`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDetailPage

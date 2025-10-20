'use client'

import React, { useState, useEffect } from 'react'
import { Camera, Heart, Share, ZoomIn, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useTripContext } from '@/contex/TripContext'

interface MediaItem {
  id: string | number;
  url: string;
  thumb: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  title?: string;
  source?: string;
  category?: string;
  likes?: number;
}

const TripGalleryUI = () => {
  const { tripData } = useTripContext()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [images, setImages] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaType, setMediaType] = useState<'images' | 'videos'>('images')

  const categories = ['All', 'Landmarks', 'Museums', 'Activities', 'Neighborhoods', 'Architecture', 'Shopping']
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    if (tripData.destination) {
      fetchMediaContent()
    }
  }, [tripData.destination, mediaType])

  const fetchMediaContent = async () => {
    if (!tripData.destination) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/media-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination: tripData.destination, 
          type: mediaType 
        })
      })
      
      const result = await response.json()
      
      if (result.data) {
        const processedData = result.data.map((item: any, index: number) => ({
          ...item,
          category: getRandomCategory(),
          likes: Math.floor(Math.random() * 2000) + 100
        }))
        
        if (mediaType === 'images') {
          setImages(processedData)
        } else {
          setVideos(processedData)
        }
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      // Fallback to placeholder data
      setImages(getPlaceholderImages())
    } finally {
      setLoading(false)
    }
  }

  const getRandomCategory = () => {
    const cats = ['Landmarks', 'Museums', 'Activities', 'Neighborhoods', 'Architecture', 'Shopping']
    return cats[Math.floor(Math.random() * cats.length)]
  }

  const getPlaceholderImages = (): MediaItem[] => [
    {
      id: 1,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(tripData.destination || 'travel')},landmark`,
      thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(tripData.destination || 'travel')},landmark`,
      alt: `${tripData.destination} landmark`,
      category: 'Landmarks',
      likes: 1234
    },
    {
      id: 2,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(tripData.destination || 'travel')},city`,
      thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(tripData.destination || 'travel')},city`,
      alt: `${tripData.destination} city view`,
      category: 'Activities',
      likes: 987
    }
  ]

  const currentMedia = mediaType === 'images' ? images : videos
  const filteredMedia = activeCategory === 'All' 
    ? currentMedia 
    : currentMedia.filter(item => item.category === activeCategory)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % filteredMedia.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length)
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              {tripData.destination ? `${tripData.destination} Gallery` : 'Trip Gallery'}
            </h3>
            <p className="text-sm text-gray-600">Explore stunning {mediaType} from your destination</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMediaType('images')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              mediaType === 'images' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-1" />
            Photos
          </button>
          <button
            onClick={() => setMediaType('videos')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              mediaType === 'videos' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Play className="w-4 h-4 inline mr-1" />
            Videos
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category)
              setSelectedImage(0)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary">Loading {mediaType}...</p>
        </div>
      )}

      {!loading && filteredMedia.length === 0 && (
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {mediaType} available for this destination</p>
        </div>
      )}

      {!loading && filteredMedia.length > 0 && (
        <>
          {/* Main Media Display */}
          <div className="relative mb-6">
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative group">
              {mediaType === 'images' ? (
                <img 
                  src={filteredMedia[selectedImage]?.url} 
                  alt={filteredMedia[selectedImage]?.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://source.unsplash.com/800x600/?${encodeURIComponent(tripData.destination || 'travel')}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-400 to-purple-500 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/70" />
                </div>
              )}
          
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Share className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Arrows */}
              {filteredMedia.length > 1 && (
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
            </div>
          </div>

          {/* Media Info */}
          <div className="mt-4 flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {filteredMedia[selectedImage]?.title || filteredMedia[selectedImage]?.alt}
              </h4>
              <p className="text-sm text-gray-600">
                {tripData.destination} • {filteredMedia[selectedImage]?.photographer || 'Unknown photographer'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{filteredMedia[selectedImage]?.likes}</span>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {filteredMedia.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedImage === index
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:opacity-80'
                }`}
              >
                {mediaType === 'images' ? (
                  <img 
                    src={item.thumb} 
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://source.unsplash.com/400x300/?${encodeURIComponent(tripData.destination || 'travel')}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-300 to-purple-400 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/70" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Media Counter */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              {selectedImage + 1} of {filteredMedia.length} {mediaType}
            </span>
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && filteredMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl"
            >
              ✕
            </button>
            {mediaType === 'images' ? (
              <img 
                src={filteredMedia[selectedImage]?.url} 
                alt={filteredMedia[selectedImage]?.alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-red-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Play className="w-24 h-24 text-white/50" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TripGalleryUI
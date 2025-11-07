'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar, 
  Users, 
  Filter,
  Search,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  Globe,
  Thermometer,
  Camera
} from 'lucide-react'
import Link from 'next/link'

interface TrendingDestination {
  id: string
  name: string
  country: string
  continent: string
  popularity: number
  averageCost: number
  bestTimeToVisit: string
  trendingReason: string
  rating: number
  images: string[]
  tags: string[]
  description: string
  highlights: string[]
  weatherInfo: string
  currency: string
  language: string
}

function Trends() {
  const [destinations, setDestinations] = useState<TrendingDestination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<TrendingDestination[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContinent, setSelectedContinent] = useState<string>('all')
  const [selectedBudget, setSelectedBudget] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'cost' | 'rating'>('popularity')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch trending destinations
    const fetchTrendingDestinations = async () => {
      setIsLoading(true)
      
      // Mock data - in real app, this would come from your API
      const mockDestinations: TrendingDestination[] = [
        {
          id: '1',
          name: 'Bali',
          country: 'Indonesia',
          continent: 'Asia',
          popularity: 95,
          averageCost: 800,
          bestTimeToVisit: 'April - October',
          trendingReason: 'Digital nomad paradise with stunning beaches',
          rating: 4.8,
          images: ['https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'],
          tags: ['Beach', 'Culture', 'Adventure', 'Wellness'],
          description: 'Tropical paradise with rich culture, beautiful temples, and world-class beaches.',
          highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'],
          weatherInfo: 'Tropical climate, 26-30°C year-round',
          currency: 'Indonesian Rupiah (IDR)',
          language: 'Indonesian, English widely spoken'
        },
        {
          id: '2',
          name: 'Santorini',
          country: 'Greece',
          continent: 'Europe',
          popularity: 92,
          averageCost: 1200,
          bestTimeToVisit: 'May - September',
          trendingReason: 'Instagram-worthy sunsets and architecture',
          rating: 4.9,
          images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'],
          tags: ['Romance', 'Photography', 'Luxury', 'History'],
          description: 'Iconic Greek island famous for white-washed buildings and breathtaking sunsets.',
          highlights: ['Oia Village', 'Red Beach', 'Akrotiri Archaeological Site', 'Wine Tasting'],
          weatherInfo: 'Mediterranean climate, perfect summers',
          currency: 'Euro (EUR)',
          language: 'Greek, English widely spoken'
        },
        {
          id: '3',
          name: 'Cape Town',
          country: 'South Africa',
          continent: 'Africa',
          popularity: 88,
          averageCost: 600,
          bestTimeToVisit: 'November - March',
          trendingReason: 'Adventure capital with stunning landscapes',
          rating: 4.7,
          images: ['https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'],
          tags: ['Adventure', 'Wildlife', 'Wine', 'Culture'],
          description: 'Vibrant city nestled between mountains and ocean, rich in history and natural beauty.',
          highlights: ['Table Mountain', 'Robben Island', 'Cape Winelands', 'Penguin Colony'],
          weatherInfo: 'Mediterranean climate, summer Dec-Feb',
          currency: 'South African Rand (ZAR)',
          language: 'English, Afrikaans, Xhosa'
        },
        {
          id: '4',
          name: 'Kyoto',
          country: 'Japan',
          continent: 'Asia',
          popularity: 90,
          averageCost: 1000,
          bestTimeToVisit: 'March - May, September - November',
          trendingReason: 'Cherry blossoms and traditional culture',
          rating: 4.8,
          images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
          tags: ['Culture', 'History', 'Food', 'Temples'],
          description: 'Ancient capital of Japan with thousands of temples, gardens, and traditional architecture.',
          highlights: ['Fushimi Inari Shrine', 'Bamboo Grove', 'Kiyomizu Temple', 'Gion District'],
          weatherInfo: 'Four distinct seasons, mild climate',
          currency: 'Japanese Yen (JPY)',
          language: 'Japanese, some English'
        },
        {
          id: '5',
          name: 'Machu Picchu',
          country: 'Peru',
          continent: 'South America',
          popularity: 85,
          averageCost: 900,
          bestTimeToVisit: 'May - September',
          trendingReason: 'Ancient wonder and hiking destination',
          rating: 4.9,
          images: ['https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800'],
          tags: ['History', 'Adventure', 'Hiking', 'Culture'],
          description: 'Ancient Incan citadel set high in the Andes Mountains, one of the New Seven Wonders.',
          highlights: ['Inca Trail', 'Huayna Picchu', 'Sacred Valley', 'Cusco City'],
          weatherInfo: 'Dry season May-Sep, rainy Oct-Apr',
          currency: 'Peruvian Sol (PEN)',
          language: 'Spanish, Quechua'
        },
        {
          id: '6',
          name: 'Reykjavik',
          country: 'Iceland',
          continent: 'Europe',
          popularity: 82,
          averageCost: 1400,
          bestTimeToVisit: 'June - August, September - March (Northern Lights)',
          trendingReason: 'Northern Lights and unique landscapes',
          rating: 4.6,
          images: ['https://images.unsplash.com/photo-1539066834-3c395d0d1b4b?w=800'],
          tags: ['Nature', 'Adventure', 'Photography', 'Unique'],
          description: 'Gateway to Iceland\'s natural wonders including geysers, waterfalls, and Northern Lights.',
          highlights: ['Blue Lagoon', 'Golden Circle', 'Northern Lights', 'Gullfoss Waterfall'],
          weatherInfo: 'Cool summers, mild winters due to Gulf Stream',
          currency: 'Icelandic Króna (ISK)',
          language: 'Icelandic, English widely spoken'
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDestinations(mockDestinations)
      setFilteredDestinations(mockDestinations)
      setIsLoading(false)
    }

    fetchTrendingDestinations()
  }, [])

  useEffect(() => {
    let filtered = destinations.filter(dest => {
      const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesContinent = selectedContinent === 'all' || dest.continent === selectedContinent
      
      const matchesBudget = selectedBudget === 'all' || 
                           (selectedBudget === 'budget' && dest.averageCost < 800) ||
                           (selectedBudget === 'mid' && dest.averageCost >= 800 && dest.averageCost < 1200) ||
                           (selectedBudget === 'luxury' && dest.averageCost >= 1200)
      
      return matchesSearch && matchesContinent && matchesBudget
    })

    // Sort destinations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'cost':
          return a.averageCost - b.averageCost
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setFilteredDestinations(filtered)
  }, [destinations, searchTerm, selectedContinent, selectedBudget, sortBy])

  const continents = ['all', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania']
  const budgetRanges = [
    { value: 'all', label: 'All Budgets' },
    { value: 'budget', label: 'Budget (<$800)' },
    { value: 'mid', label: 'Mid-range ($800-$1200)' },
    { value: 'luxury', label: 'Luxury ($1200+)' }
  ]

  const handleCreateTrip = (destination: TrendingDestination) => {
    // Store destination data in localStorage for the create-trip page
    localStorage.setItem('selectedDestination', JSON.stringify({
      destination: `${destination.name}, ${destination.country}`,
      interests: destination.tags,
      budget: destination.averageCost < 800 ? 'Budget' : destination.averageCost < 1200 ? 'Mid-range' : 'Luxury'
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trending destinations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Trending Destinations</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the world's most popular travel destinations, curated by AI and loved by travelers worldwide.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search destinations, countries, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {continents.map(continent => (
                  <option key={continent} value={continent}>
                    {continent === 'all' ? 'All Continents' : continent}
                  </option>
                ))}
              </select>

              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {budgetRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popularity' | 'cost' | 'rating')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="cost">Sort by Cost</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} of {destinations.length} destinations
          </p>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.images[0]}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-2 py-1 rounded-full text-sm font-medium">
                      #{destination.popularity} Trending
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                        <p className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {destination.country}, {destination.continent}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{destination.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{destination.description}</p>
                    
                    <div className="text-sm text-primary font-medium mb-3">
                      {destination.trendingReason}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {destination.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Average Cost:
                      </span>
                      <span className="font-medium">${destination.averageCost}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Best Time:
                      </span>
                      <span className="font-medium">{destination.bestTimeToVisit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        Weather:
                      </span>
                      <span className="font-medium text-xs">{destination.weatherInfo}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Top Highlights:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {destination.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href="/create-trip" className="flex-1" onClick={() => handleCreateTrip(destination)}>
                      <Button className="w-full flex items-center justify-center gap-2">
                        Plan Trip
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="px-3">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedContinent('all')
              setSelectedBudget('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white">
          <Camera className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Let our AI create the perfect itinerary for your dream destination
          </p>
          <Link href="/create-trip">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start Planning Your Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Trends
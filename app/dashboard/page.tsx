'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Download,
  Share2,
  Trash2,
  Plus,
  Filter,
  Search,
  Clock,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Trip {
  _id: string
  destination: string
  sourceLocation?: string
  duration: number
  groupSize: string
  budget: string
  interests: string[]
  isPublic: boolean
  _creationTime: number
  status?: string
}

interface TripLimitStatus {
  remaining: number
  canCreateTrip: boolean
  subscription: string
  planLimits: {
    trips: number
    intervalName: string
    price: string
    currency: string
  }
  dueDate?: string
}

const Dashboard = () => {
  const { user } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'destination'>('newest')
  const [tripLimitStatus, setTripLimitStatus] = useState<TripLimitStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)

  const trips = useQuery(api.trips.getUserTrips, user ? { userId: user.id } : 'skip') as
    | Trip[]
    | undefined
  const deleteTrip = useMutation(api.trips.deleteTrip)

  useEffect(() => {
    const fetchTripLimitStatus = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/trip-limit', {
          headers: {
            Authorization: `Bearer ${user.id}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTripLimitStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch trip limit status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTripLimitStatus()
  }, [user])

  const handleCreateTrip = async () => {
    if (!tripLimitStatus?.canCreateTrip) {
      setNotification({
        type: 'warning',
        message: `You've reached your ${tripLimitStatus?.planLimits.intervalName} limit. Upgrade your plan to create more trips.`,
      })
      setTimeout(() => router.push('/pricing'), 2000)
      return
    }

    router.push('/create-trip')
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip({ tripId })
        setNotification({ type: 'success', message: 'Trip deleted successfully' })
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete trip' })
      }
    }
  }

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'pro':
        return 'text-blue-600 bg-blue-50'
      case 'premium':
        return 'text-purple-600 bg-purple-50'
      case 'enterprise':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredTrips = trips
    ?.filter(trip => {
      const matchesSearch =
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.sourceLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filterBy === 'all' ||
        (filterBy === 'public' && trip.isPublic) ||
        (filterBy === 'private' && !trip.isPublic)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b._creationTime - a._creationTime
        case 'oldest':
          return a._creationTime - b._creationTime
        case 'destination':
          return a.destination.localeCompare(b.destination)
        default:
          return 0
      }
    })

  const handleDownloadTrip = (trip: Trip) => {
    const tripData = {
      destination: trip.destination,
      sourceLocation: trip.sourceLocation,
      duration: trip.duration,
      groupSize: trip.groupSize,
      budget: trip.budget,
      interests: trip.interests,
      createdAt: new Date(trip._creationTime).toLocaleDateString(),
    }

    const csvContent = [
      ['Field', 'Value'],
      ['Destination', tripData.destination],
      ['Source Location', tripData.sourceLocation || 'Not specified'],
      ['Duration', `${tripData.duration} days`],
      ['Group Size', tripData.groupSize],
      ['Budget', tripData.budget],
      ['Interests', tripData.interests.join(', ')],
      ['Created At', tripData.createdAt],
    ]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-${trip.destination.replace(/\s+/g, '-').toLowerCase()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateQRCode = (trip: Trip) => {
    const tripUrl = `${window.location.origin}/trip/${trip._id}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tripUrl)}`

    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code - ${trip.destination}</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif;">
            <h2>Trip QR Code</h2>
            <p>${trip.destination}</p>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px;" />
            <p style="margin-top: 20px; text-align: center; max-width: 300px;">
              Scan this QR code to view trip details on any device
            </p>
          </body>
        </html>
      `)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
              <p className="text-gray-600 mt-1">Manage your trips and explore new destinations</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateTrip} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Trip
              </Button>
              <Link href="/pricing">
                <Button variant="outline" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={e => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Trips</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="destination">By Destination</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{trips?.length || 0}</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trips Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? '...'
                      : tripLimitStatus?.remaining === -1
                        ? '∞'
                        : tripLimitStatus?.remaining || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <p
                    className={`text-lg font-bold capitalize px-2 py-1 rounded-full text-sm ${getSubscriptionColor(
                      tripLimitStatus?.subscription || 'basic'
                    )}`}
                  >
                    {tripLimitStatus?.subscription || 'Basic'}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trips?.filter(trip => trip.status === 'active').length || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCreateTrip()}
          >
            <CardContent className="p-6 text-center">
              <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Plan New Trip</h3>
              <p className="text-sm text-gray-600">Create your next adventure with AI assistance</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/tracking')}
          >
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Track Location</h3>
              <p className="text-sm text-gray-600">Monitor your current trip progress</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/trends')}
          >
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibent text-gray-900 mb-2">Explore Trends</h3>
              <p className="text-sm text-gray-600">Discover popular destinations</p>
            </CardContent>
          </Card>
        </div>

        {/* Trips Grid */}
        {filteredTrips && filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <Card key={trip._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Trip Cover Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={
                      (trip as any).coverImage ||
                      `https://source.unsplash.com/1200x800/?${encodeURIComponent(trip.destination)},travel,landmark,city`
                    }
                    alt={`${trip.destination} cover`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('picsum')) {
                        target.src = `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 1000)}`
                      }
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <CardTitle className="text-lg font-semibold text-white">
                      {trip.destination}
                    </CardTitle>
                    {trip.sourceLocation && (
                      <p className="text-sm text-white/80 mt-1">From {trip.sourceLocation}</p>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {trip.isPublic ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Public trip" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full" title="Private trip" />
                    )}
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'active'
                          ? 'bg-green-500 text-white'
                          : trip.status === 'completed'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                      }`}
                    >
                      {trip.status || 'planned'}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{trip.duration} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>{trip.groupSize}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span>{trip.budget}</span>
                      </div>
                    </div>

                    {trip.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Interests:</p>
                        <div className="flex flex-wrap gap-1">
                          {trip.interests.slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                          {trip.interests.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{trip.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Created: {new Date(trip._creationTime).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Link href={`/trip/${trip._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTrip(trip)}
                        title="Download CSV"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateQRCode(trip)}
                        title="Generate QR Code"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTrip(trip._id)}
                        title="Delete Trip"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start planning your first amazing journey!'}
            </p>
            {!searchTerm && filterBy === 'all' && (
              <Link href="/create-trip">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Trip
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

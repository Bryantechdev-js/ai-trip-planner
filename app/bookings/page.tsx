'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Plane,
  Hotel,
  Car,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Download,
  Bell,
  Star,
} from 'lucide-react'

interface Booking {
  _id: string
  userId: string
  tripId: string
  type: 'hotel' | 'flight' | 'activity' | 'transport'
  title: string
  description: string
  price: number
  currency: string
  bookingDate: number
  serviceDate: number
  status: 'pending' | 'confirmed' | 'cancelled'
  provider: string
  confirmationCode?: string
  details: {
    location?: string
    duration?: string
    participants?: number
    specialRequests?: string
  }
}

const BookingsPage = () => {
  const { user } = useUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hotel' | 'flight' | 'activity' | 'transport'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>(
    'all'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'flight':
        return <Plane className="w-5 h-5" />
      case 'activity':
        return <Activity className="w-5 h-5" />
      case 'transport':
        return <Car className="w-5 h-5" />
      default:
        return <MapPin className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesType = filter === 'all' || booking.type === filter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesSearch =
      searchTerm === '' ||
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.details.location?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  const handleAutoBook = async (tripId: string) => {
    try {
      const response = await fetch('/api/booking/auto-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Auto-booking initiated! ${result.bookingsCreated} bookings created.`)
        fetchBookings()
      }
    } catch (error) {
      console.error('Auto-booking error:', error)
      alert('Auto-booking failed. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your bookings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage all your travel bookings in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()} XAF
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                />
              </div>

              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="hotel">Hotels</option>
                <option value="flight">Flights</option>
                <option value="activity">Activities</option>
                <option value="transport">Transport</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
              <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getBookingIcon(booking.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {booking.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{booking.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">{booking.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(booking.serviceDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>
                          {booking.price.toLocaleString()} {booking.currency}
                        </span>
                      </div>
                      {booking.details.location && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="truncate">{booking.details.location}</span>
                        </div>
                      )}
                      {booking.details.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{booking.details.duration}</span>
                        </div>
                      )}
                    </div>

                    {booking.confirmationCode && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-1">Confirmation Code</p>
                        <p className="text-sm font-mono text-gray-900">
                          {booking.confirmationCode}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      {booking.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' || statusFilter !== 'all'
                ? 'No bookings found'
                : 'No bookings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start booking your travel services!'}
            </p>
            {!searchTerm && filter === 'all' && statusFilter === 'all' && (
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Booking
              </Button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleAutoBook('sample-trip-id')}
            >
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-medium">Auto-Book Trip</span>
              <span className="text-xs text-gray-600">Let AI book everything for you</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" />
              <span className="font-medium">Set Reminders</span>
              <span className="text-xs text-gray-600">Get notified about your bookings</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="w-6 h-6 text-green-500" />
              <span className="font-medium">Export Itinerary</span>
              <span className="text-xs text-gray-600">Download your complete travel plan</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingsPage

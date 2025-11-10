'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MobileMoneyInput } from '@/components/ui/mobile-money-input'
import {
  Calendar,
  Users,
  MapPin,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'

interface BookingFormProps {
  tripData?: {
    destination: string
    duration: number
    groupSize: string
    budget: string
    interests: string[]
  }
  onClose: () => void
  onSuccess?: (bookingId: string) => void
}

interface BookingDetails {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
  specialRequests: string
  contactEmail: string
  contactPhone: string
}

const BookingForm: React.FC<BookingFormProps> = ({ tripData, onClose, onSuccess }) => {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('mobile')
  const [mobileNumber, setMobileNumber] = useState('')
  
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    destination: tripData?.destination || '',
    checkIn: '',
    checkOut: '',
    guests: parseInt(tripData?.groupSize?.replace(/\D/g, '') || '2'),
    rooms: 1,
    specialRequests: '',
    contactEmail: user?.emailAddresses[0]?.emailAddress || '',
    contactPhone: '',
  })

  const handleInputChange = (field: keyof BookingDetails, value: string | number) => {
    setBookingDetails(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    return (
      bookingDetails.destination &&
      bookingDetails.checkIn &&
      bookingDetails.checkOut &&
      bookingDetails.guests > 0 &&
      bookingDetails.contactEmail
    )
  }

  const validateStep2 = () => {
    if (paymentMethod === 'mobile') {
      const phoneRegex = /^(237)?[67]\d{8}$/
      return phoneRegex.test(mobileNumber.replace(/\s+/g, ''))
    }
    return true // Card payment validation would be handled by Clerk
  }

  const handleSubmitBooking = async () => {
    if (!user) {
      toast.error('Please sign in to complete your booking')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create booking record
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'hotel',
          title: `${bookingDetails.destination} Hotel Booking`,
          description: `${bookingDetails.rooms} room(s) for ${bookingDetails.guests} guest(s)`,
          price: calculateTotalPrice(),
          currency: 'XAF',
          serviceDate: new Date(bookingDetails.checkIn).getTime(),
          details: {
            location: bookingDetails.destination,
            duration: `${Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights`,
            participants: bookingDetails.guests,
            specialRequests: bookingDetails.specialRequests,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            rooms: bookingDetails.rooms,
            contactEmail: bookingDetails.contactEmail,
            contactPhone: bookingDetails.contactPhone,
          },
          provider: 'AI Trip Planner Hotels',
          status: 'pending',
        }),
      })

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking')
      }

      const booking = await bookingResponse.json()

      // Process payment if mobile money
      if (paymentMethod === 'mobile') {
        const paymentResponse = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: 'booking',
            amount: calculateTotalPrice(),
            currency: 'XAF',
            paymentMethod: 'momo',
            phoneNumber: mobileNumber,
            bookingId: booking.bookingId,
          }),
        })

        const paymentResult = await paymentResponse.json()

        if (paymentResult.success && paymentResult.paymentUrl) {
          // Redirect to payment page
          window.open(paymentResult.paymentUrl, '_blank')
          toast.success('Booking created! Complete payment in the new window.')
        } else {
          throw new Error(paymentResult.error || 'Payment initiation failed')
        }
      } else {
        // Handle card payment with Clerk (placeholder)
        toast.info('Card payment integration coming soon! Using mobile money for now.')
        return
      }

      toast.success('Booking submitted successfully!')
      onSuccess?.(booking.bookingId)
      onClose()

    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error instanceof Error ? error.message : 'Booking failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalPrice = () => {
    const basePrice = 45000 // Base price per night in XAF
    const nights = Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return basePrice * nights * bookingDetails.rooms
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMinCheckOutDate = () => {
    if (!bookingDetails.checkIn) return getTomorrowDate()
    const checkIn = new Date(bookingDetails.checkIn)
    checkIn.setDate(checkIn.getDate() + 1)
    return checkIn.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Complete Your Booking</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Step {step} of 2 - {step === 1 ? 'Booking Details' : 'Payment Information'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              {/* Booking Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={bookingDetails.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter destination"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={bookingDetails.checkIn}
                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                        min={getTomorrowDate()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={bookingDetails.checkOut}
                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                        min={getMinCheckOutDate()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={bookingDetails.guests}
                        onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      value={bookingDetails.rooms}
                      onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 1)}
                      min="1"
                      max="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={bookingDetails.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingDetails.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="237XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingDetails.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Any special requirements or preferences..."
                  />
                </div>
              </div>

              {/* Price Summary */}
              {bookingDetails.checkIn && bookingDetails.checkOut && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>
                        {Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{bookingDetails.rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span>{bookingDetails.guests}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>{calculateTotalPrice().toLocaleString()} XAF</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                  className="px-6"
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Select Payment Method</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('mobile')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      paymentMethod === 'mobile'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Mobile Money</div>
                    <div className="text-xs text-gray-600">MTN/Orange</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Credit Card</div>
                    <div className="text-xs text-gray-600">Visa/Mastercard</div>
                  </button>
                </div>

                {paymentMethod === 'mobile' && (
                  <div className="space-y-4">
                    <MobileMoneyInput
                      value={mobileNumber}
                      onChange={setMobileNumber}
                      placeholder="Enter your mobile money number"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Mobile Money Payment</p>
                          <p>You will receive a payment prompt on your phone to complete the transaction.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Card Payment</p>
                        <p>Credit card payment integration is coming soon. Please use Mobile Money for now.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Final Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Final Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-medium">{bookingDetails.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <span>{bookingDetails.checkIn} to {bookingDetails.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{paymentMethod === 'mobile' ? 'Mobile Money' : 'Credit Card'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                    <span>Total Amount:</span>
                    <span>{calculateTotalPrice().toLocaleString()} XAF</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Details
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={!validateStep2() || isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Booking
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BookingForm
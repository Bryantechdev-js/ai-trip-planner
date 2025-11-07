import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, bookingType, preferences, autoConfirm = false } = await req.json()

    const bookingResult = await processAutoBooking({
      userId,
      tripId,
      bookingType,
      preferences,
      autoConfirm,
    })

    return NextResponse.json({
      success: true,
      bookingId: bookingResult.bookingId,
      status: bookingResult.status,
      details: bookingResult.details,
      estimatedSavings: bookingResult.estimatedSavings,
    })
  } catch (error) {
    console.error('Auto-booking error:', error)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}

async function processAutoBooking(params: any) {
  const { userId, tripId, bookingType, preferences, autoConfirm } = params

  switch (bookingType) {
    case 'hotel':
      return await autoBookHotel(userId, tripId, preferences, autoConfirm)
    case 'flight':
      return await autoBookFlight(userId, tripId, preferences, autoConfirm)
    case 'activity':
      return await autoBookActivity(userId, tripId, preferences, autoConfirm)
    case 'transport':
      return await autoBookTransport(userId, tripId, preferences, autoConfirm)
    default:
      throw new Error('Invalid booking type')
  }
}

async function autoBookHotel(
  userId: string,
  tripId: string,
  preferences: any,
  autoConfirm: boolean
) {
  const hotels = await searchOptimalHotels(preferences)
  const bestHotel = selectBestOption(hotels, preferences)

  if (autoConfirm && bestHotel.score > 0.8) {
    return {
      bookingId: `hotel_${Date.now()}`,
      status: 'confirmed',
      details: bestHotel,
      estimatedSavings: calculateSavings(bestHotel, hotels),
    }
  }

  return {
    bookingId: `hotel_${Date.now()}`,
    status: 'pending_approval',
    details: bestHotel,
    estimatedSavings: calculateSavings(bestHotel, hotels),
  }
}

async function autoBookFlight(
  userId: string,
  tripId: string,
  preferences: any,
  autoConfirm: boolean
) {
  const flights = await searchOptimalFlights(preferences)
  const bestFlight = selectBestOption(flights, preferences)

  return {
    bookingId: `flight_${Date.now()}`,
    status: autoConfirm ? 'confirmed' : 'pending_approval',
    details: bestFlight,
    estimatedSavings: calculateSavings(bestFlight, flights),
  }
}

async function autoBookActivity(
  userId: string,
  tripId: string,
  preferences: any,
  autoConfirm: boolean
) {
  const activities = await searchOptimalActivities(preferences)
  const bestActivity = selectBestOption(activities, preferences)

  return {
    bookingId: `activity_${Date.now()}`,
    status: autoConfirm ? 'confirmed' : 'pending_approval',
    details: bestActivity,
    estimatedSavings: calculateSavings(bestActivity, activities),
  }
}

async function autoBookTransport(
  userId: string,
  tripId: string,
  preferences: any,
  autoConfirm: boolean
) {
  const transports = await searchOptimalTransport(preferences)
  const bestTransport = selectBestOption(transports, preferences)

  return {
    bookingId: `transport_${Date.now()}`,
    status: autoConfirm ? 'confirmed' : 'pending_approval',
    details: bestTransport,
    estimatedSavings: calculateSavings(bestTransport, transports),
  }
}

async function searchOptimalHotels(preferences: any) {
  return [
    {
      id: 'hotel1',
      name: 'Grand Plaza Hotel',
      rating: 4.5,
      price: 150,
      location: preferences.location,
      amenities: ['wifi', 'pool', 'gym'],
      score: 0.9,
    },
    {
      id: 'hotel2',
      name: 'Budget Inn',
      rating: 3.8,
      price: 80,
      location: preferences.location,
      amenities: ['wifi'],
      score: 0.7,
    },
  ]
}

async function searchOptimalFlights(preferences: any) {
  return [
    {
      id: 'flight1',
      airline: 'SkyLine',
      price: 450,
      duration: '5h 30m',
      stops: 0,
      score: 0.85,
    },
  ]
}

async function searchOptimalActivities(preferences: any) {
  return [
    {
      id: 'activity1',
      name: 'City Walking Tour',
      price: 25,
      duration: '3 hours',
      rating: 4.7,
      score: 0.9,
    },
  ]
}

async function searchOptimalTransport(preferences: any) {
  return [
    {
      id: 'transport1',
      type: 'taxi',
      price: 30,
      duration: '20 minutes',
      score: 0.8,
    },
  ]
}

function selectBestOption(options: any[], preferences: any) {
  return options.reduce((best, current) => (current.score > best.score ? current : best))
}

function calculateSavings(selected: any, allOptions: any[]) {
  const avgPrice = allOptions.reduce((sum, option) => sum + option.price, 0) / allOptions.length
  return Math.max(0, avgPrice - selected.price)
}

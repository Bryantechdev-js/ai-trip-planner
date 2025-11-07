import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, bookingType, preferences, autoConfirm = false } = await req.json();

    const booking = await processAutoBooking({
      userId,
      tripId,
      bookingType,
      preferences,
      autoConfirm
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: booking.status,
      details: booking.details,
      confirmationRequired: !autoConfirm
    });

  } catch (error) {
    console.error('Auto booking error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

async function processAutoBooking(params: any) {
  const { userId, tripId, bookingType, preferences, autoConfirm } = params;

  switch (bookingType) {
    case 'hotel':
      return await autoBookHotel(userId, tripId, preferences, autoConfirm);
    case 'flight':
      return await autoBookFlight(userId, tripId, preferences, autoConfirm);
    case 'activity':
      return await autoBookActivity(userId, tripId, preferences, autoConfirm);
    case 'transport':
      return await autoBookTransport(userId, tripId, preferences, autoConfirm);
    default:
      throw new Error('Invalid booking type');
  }
}

async function autoBookHotel(userId: string, tripId: string, preferences: any, autoConfirm: boolean) {
  const hotels = await searchHotels(preferences);
  const bestMatch = selectBestHotel(hotels, preferences);
  
  if (autoConfirm && bestMatch) {
    return await confirmHotelBooking(bestMatch, userId, tripId);
  }
  
  return {
    id: `hotel_${Date.now()}`,
    status: 'pending_confirmation',
    details: {
      hotel: bestMatch,
      alternatives: hotels.slice(0, 3),
      totalCost: bestMatch?.price * preferences.nights || 0
    }
  };
}

async function autoBookFlight(userId: string, tripId: string, preferences: any, autoConfirm: boolean) {
  const flights = await searchFlights(preferences);
  const bestMatch = selectBestFlight(flights, preferences);
  
  if (autoConfirm && bestMatch) {
    return await confirmFlightBooking(bestMatch, userId, tripId);
  }
  
  return {
    id: `flight_${Date.now()}`,
    status: 'pending_confirmation',
    details: {
      flight: bestMatch,
      alternatives: flights.slice(0, 3),
      totalCost: bestMatch?.price || 0
    }
  };
}

async function autoBookActivity(userId: string, tripId: string, preferences: any, autoConfirm: boolean) {
  const activities = await searchActivities(preferences);
  const selectedActivities = selectBestActivities(activities, preferences);
  
  return {
    id: `activity_${Date.now()}`,
    status: autoConfirm ? 'confirmed' : 'pending_confirmation',
    details: {
      activities: selectedActivities,
      totalCost: selectedActivities.reduce((sum: number, act: any) => sum + act.price, 0)
    }
  };
}

async function autoBookTransport(userId: string, tripId: string, preferences: any, autoConfirm: boolean) {
  const transportOptions = await searchTransport(preferences);
  const bestOption = selectBestTransport(transportOptions, preferences);
  
  return {
    id: `transport_${Date.now()}`,
    status: autoConfirm ? 'confirmed' : 'pending_confirmation',
    details: {
      transport: bestOption,
      alternatives: transportOptions.slice(0, 2),
      totalCost: bestOption?.price || 0
    }
  };
}

async function searchHotels(preferences: any) {
  return [
    {
      id: 'hotel_1',
      name: `Premium Hotel ${preferences.destination}`,
      rating: 4.5,
      price: preferences.budget ? Math.min(preferences.budget * 0.4, 200) : 150,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      location: 'City Center'
    },
    {
      id: 'hotel_2',
      name: `Boutique Inn ${preferences.destination}`,
      rating: 4.2,
      price: preferences.budget ? Math.min(preferences.budget * 0.3, 120) : 100,
      amenities: ['WiFi', 'Breakfast', 'Concierge'],
      location: 'Historic District'
    }
  ];
}

async function searchFlights(preferences: any) {
  return [
    {
      id: 'flight_1',
      airline: 'Premium Airways',
      departure: preferences.source,
      arrival: preferences.destination,
      price: preferences.budget ? Math.min(preferences.budget * 0.3, 500) : 400,
      duration: '3h 45m',
      stops: 0
    }
  ];
}

async function searchActivities(preferences: any) {
  return [
    {
      id: 'activity_1',
      name: `${preferences.destination} City Tour`,
      type: 'sightseeing',
      price: 50,
      duration: '4 hours',
      rating: 4.7
    },
    {
      id: 'activity_2',
      name: `${preferences.destination} Food Experience`,
      type: 'culinary',
      price: 75,
      duration: '3 hours',
      rating: 4.8
    }
  ];
}

async function searchTransport(preferences: any) {
  return [
    {
      id: 'transport_1',
      type: 'rental_car',
      provider: 'Premium Rentals',
      price: 45,
      duration: 'per day'
    },
    {
      id: 'transport_2',
      type: 'taxi_service',
      provider: 'City Cabs',
      price: 25,
      duration: 'per trip'
    }
  ];
}

function selectBestHotel(hotels: any[], preferences: any) {
  return hotels.sort((a, b) => {
    const scoreA = calculateHotelScore(a, preferences);
    const scoreB = calculateHotelScore(b, preferences);
    return scoreB - scoreA;
  })[0];
}

function selectBestFlight(flights: any[], preferences: any) {
  return flights.sort((a, b) => {
    const scoreA = calculateFlightScore(a, preferences);
    const scoreB = calculateFlightScore(b, preferences);
    return scoreB - scoreA;
  })[0];
}

function selectBestActivities(activities: any[], preferences: any) {
  return activities
    .sort((a, b) => b.rating - a.rating)
    .slice(0, Math.min(3, activities.length));
}

function selectBestTransport(options: any[], preferences: any) {
  return options[0]; // Simple selection for demo
}

function calculateHotelScore(hotel: any, preferences: any) {
  let score = hotel.rating * 20;
  if (preferences.budget && hotel.price <= preferences.budget * 0.4) {
    score += 10;
  }
  return score;
}

function calculateFlightScore(flight: any, preferences: any) {
  let score = 50;
  if (flight.stops === 0) score += 20;
  if (preferences.budget && flight.price <= preferences.budget * 0.3) {
    score += 15;
  }
  return score;
}

async function confirmHotelBooking(hotel: any, userId: string, tripId: string) {
  return {
    id: `hotel_booking_${Date.now()}`,
    status: 'confirmed',
    details: {
      hotel,
      confirmationNumber: `HTL${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      totalCost: hotel.price
    }
  };
}

async function confirmFlightBooking(flight: any, userId: string, tripId: string) {
  return {
    id: `flight_booking_${Date.now()}`,
    status: 'confirmed',
    details: {
      flight,
      confirmationNumber: `FLT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      totalCost: flight.price
    }
  };
}
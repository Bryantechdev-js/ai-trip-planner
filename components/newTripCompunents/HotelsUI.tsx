'use client'

import React, { useState } from 'react'
import { Hotel, Star, Wifi, Car, Coffee, MapPin } from 'lucide-react'

interface HotelsUIProps {
  onHotelSelect?: (hotelId: string, label: string) => void;
}

const HotelsUI = ({ onHotelSelect }: HotelsUIProps) => {
  const [selectedHotel, setSelectedHotel] = useState<string>('')
  
  const handleHotelSelect = (hotelId: string, label: string) => {
    setSelectedHotel(hotelId);
    if (onHotelSelect) {
      setTimeout(() => onHotelSelect(hotelId, label), 500);
    }
  };

  const hotels = [
    {
      id: 'luxury',
      name: 'Grand Palace Hotel',
      rating: 5,
      price: '$450/night',
      image: '/api/placeholder/300/200',
      location: 'City Center',
      amenities: ['Free WiFi', 'Spa', 'Pool', 'Restaurant'],
      description: 'Luxury 5-star hotel with world-class amenities'
    },
    {
      id: 'boutique',
      name: 'Boutique Charm Inn',
      rating: 4,
      price: '$280/night',
      image: '/api/placeholder/300/200',
      location: 'Historic District',
      amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Bar'],
      description: 'Stylish boutique hotel with personalized service'
    },
    {
      id: 'budget',
      name: 'Comfort Stay Hotel',
      rating: 3,
      price: '$120/night',
      image: '/api/placeholder/300/200',
      location: 'Near Airport',
      amenities: ['Free WiFi', 'Breakfast', 'Parking'],
      description: 'Clean and comfortable budget-friendly option'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Hotel className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recommended Hotels</h3>
          <p className="text-sm text-gray-600">Choose your perfect accommodation</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelSelect(hotel.id, hotel.name)}
            className={`border-2 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
              selectedHotel === hotel.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="h-48 md:h-full bg-gray-200 flex items-center justify-center">
                  <Hotel className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              
              <div className="md:w-2/3 p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{hotel.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(hotel.rating)}</div>
                      <span className="text-sm text-gray-600">({hotel.rating} stars)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{hotel.price}</div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{hotel.location}</span>
                </div>

                <p className="text-gray-700 text-sm mb-4">{hotel.description}</p>

                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedHotel === hotel.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedHotel === hotel.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  
                  {selectedHotel === hotel.id && (
                    <span className="text-sm text-primary font-medium">Selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedHotel && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            ✓ Great choice! {hotels.find(h => h.id === selectedHotel)?.name} has been added to your trip plan.
          </p>
        </div>
      )}
    </div>
  )
}

export default HotelsUI
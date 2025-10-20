"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, DollarSign, Heart, Clock } from "lucide-react";
import { useState } from "react";

export default function PublicTrips() {
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const publicTrips = useQuery(api.trips.getPublicTrips, 
    selectedDestination ? { destination: selectedDestination } : {}
  );

  if (!publicTrips) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading inspiring trips...</span>
      </div>
    );
  }

  const destinations = [...new Set(publicTrips.map(trip => trip.destination))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Amazing Trips</h2>
        <p className="text-gray-600 mb-4">Get inspired by trips planned by other travelers</p>
        
        {/* Destination Filter */}
        {destinations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setSelectedDestination("")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedDestination === "" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Destinations
            </button>
            {destinations.slice(0, 6).map((destination) => (
              <button
                key={destination}
                onClick={() => setSelectedDestination(destination)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedDestination === destination 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {destination}
              </button>
            ))}
          </div>
        )}
      </div>

      {publicTrips.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No public trips yet</h3>
          <p className="text-gray-500">Be the first to share your amazing trip plan!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicTrips.map((trip) => (
            <Card key={trip._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {trip.destination}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      From {trip.sourceLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{trip.duration} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">{trip.groupSize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600">{trip.budget}</span>
                  </div>
                </div>

                {/* Interests */}
                {trip.interests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Interests</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trip.interests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
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

                {/* Top Attractions */}
                {trip.tripPlan.attractions.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2 text-sm">Top Attractions:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {trip.tripPlan.attractions.slice(0, 3).map((attraction, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          {attraction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Culture Info */}
                {trip.tripPlan.culture?.currency && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Currency: {trip.tripPlan.culture.currency}</span>
                      {trip.tripPlan.culture.timezone && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trip.tripPlan.culture.timezone}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
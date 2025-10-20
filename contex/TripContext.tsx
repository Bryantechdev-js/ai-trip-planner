'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TripData {
  destination: string;
  sourceLocation: string;
  groupSize: string;
  budget: string;
  duration: number;
  interests: string[];
  locationData?: {
    attractions: string[];
    cuisine: string[];
    culture: {
      languages: string[];
      currency: string;
      timezone: string;
      tips: string[];
    };
    images: string[];
    virtualTourData: {
      locations: Array<{
        name: string;
        panoramaUrl: string;
        description: string;
      }>;
    };
  };
}

interface TripContextType {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
  resetTripData: () => void;
}

const defaultTripData: TripData = {
  destination: '',
  sourceLocation: '',
  groupSize: '',
  budget: '',
  duration: 0,
  interests: []
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tripData, setTripData] = useState<TripData>(defaultTripData);

  const updateTripData = (data: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...data }));
  };

  const resetTripData = () => {
    setTripData(defaultTripData);
  };

  return (
    <TripContext.Provider value={{ tripData, updateTripData, resetTripData }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
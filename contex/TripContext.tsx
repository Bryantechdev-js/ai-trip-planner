'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface TripData {
  id?: string;
  destination: string;
  sourceLocation: string;
  groupSize: string;
  budget: string;
  duration: number;
  interests: string[];
  travelDates?: {
    startDate: string;
    endDate: string;
  };
  preferences?: {
    accommodation: 'budget' | 'mid-range' | 'luxury';
    transportation: 'public' | 'rental' | 'private';
    activities: string[];
    dietary: string[];
    accessibility?: string[];
    travelStyle: 'adventure' | 'relaxation' | 'cultural' | 'business' | 'family';
  };
  locationData?: {
    attractions: string[];
    cuisine: string[];
    culture: {
      languages: string[];
      currency: string;
      timezone: string;
      tips: string[];
      safetyInfo: string[];
      localCustoms: string[];
    };
    images: string[];
    virtualTourData: {
      locations: Array<{
        name: string;
        panoramaUrl: string;
        description: string;
        coordinates: { lat: number; lng: number };
      }>;
    };
    weather?: {
      current: any;
      forecast: any[];
      alerts?: any[];
    };
    hotels?: any[];
    flights?: any[];
    restaurants?: any[];
    localTransport?: any[];
    emergencyContacts?: any[];
  };
  itinerary?: {
    days: Array<{
      day: number;
      date: string;
      activities: Array<{
        time: string;
        activity: string;
        location: string;
        cost?: number;
        duration?: string;
        bookingStatus?: 'pending' | 'confirmed' | 'cancelled';
        confirmationNumber?: string;
        coordinates?: { lat: number; lng: number };
      }>;
    }>;
  };
  expenses?: {
    total: number;
    breakdown: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      miscellaneous: number;
    };
    realTimeTracking?: {
      spent: number;
      remaining: number;
      alerts: boolean;
    };
  };
  smartRecommendations?: {
    alternatives: any[];
    upgrades: any[];
    savings: any[];
    localDeals: any[];
  };
  collaboration?: {
    sharedWith: string[];
    permissions: { [userId: string]: 'view' | 'edit' | 'admin' };
    comments: Array<{
      userId: string;
      message: string;
      timestamp: string;
    }>;
  };
  bookingDetails?: {
    reference: string;
    confirmations: any[];
    paymentStatus: 'pending' | 'paid' | 'refunded';
    cancellationPolicy: string;
  };
  status: 'draft' | 'planning' | 'booked' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  offlineChanges?: boolean;
}

interface TripContextType {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
  resetTripData: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  autoGenerateItinerary: () => Promise<void>;
  bookTrip: () => Promise<boolean>;
  saveTrip: () => Promise<void>;
  // Enhanced features
  getSmartRecommendations: () => Promise<void>;
  shareTrip: (userIds: string[], permission: 'view' | 'edit') => Promise<void>;
  addComment: (message: string) => Promise<void>;
  optimizeItinerary: () => Promise<void>;
  trackExpenses: (expense: { amount: number; category: string; description: string }) => void;
  syncOfflineChanges: () => Promise<void>;
  exportTrip: (format: 'pdf' | 'ical' | 'json') => Promise<string>;
  duplicateTrip: () => Promise<string>;
  cancelBooking: () => Promise<boolean>;
  getRealTimeUpdates: () => Promise<void>;
  isOffline: boolean;
  hasUnsyncedChanges: boolean;
}

const defaultTripData: TripData = {
  destination: '',
  sourceLocation: '',
  groupSize: '',
  budget: '',
  duration: 0,
  interests: [],
  status: 'draft'
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tripData, setTripData] = useState<TripData>(defaultTripData);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);

  const updateTripData = (data: Partial<TripData>) => {
    setTripData(prev => ({ 
      ...prev, 
      ...data, 
      updatedAt: new Date().toISOString(),
      offlineChanges: isOffline ? true : prev.offlineChanges
    }));
    
    if (isOffline) {
      setHasUnsyncedChanges(true);
      // Store changes locally
      localStorage.setItem('unsyncedTripChanges', JSON.stringify({ ...tripData, ...data }));
    }
  };

  const resetTripData = () => {
    setTripData({
      ...defaultTripData,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined
    });
  };

  const autoGenerateItinerary = async () => {
    if (!tripData.destination || !tripData.duration) return;
    
    setIsLoading(true);
    try {
      // Enhanced AI-powered itinerary generation
      const response = await fetch('/api/aimodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_smart_itinerary',
          tripData: tripData,
          includeRealTimeData: true,
          optimizeForBudget: true,
          includeAccessibility: tripData.preferences?.accessibility?.length > 0
        })
      });
      
      const result = await response.json();
      if (result.success) {
        updateTripData({
          itinerary: result.itinerary,
          expenses: {
            ...result.expenses,
            realTimeTracking: {
              spent: 0,
              remaining: result.expenses.total,
              alerts: true
            }
          },
          locationData: {
            ...tripData.locationData,
            ...result.locationData
          },
          smartRecommendations: result.recommendations,
          status: 'planning'
        });
        
        // Auto-save after generation
        await saveTrip();
      }
    } catch (error) {
      console.error('Auto-generation failed:', error);
      if (isOffline) {
        // Generate basic offline itinerary
        generateOfflineItinerary();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bookTrip = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Automated booking process
      const response = await fetch('/api/booking/auto-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData })
      });
      
      const result = await response.json();
      if (result.success) {
        updateTripData({
          status: 'booked',
          locationData: {
            ...tripData.locationData,
            hotels: result.bookedHotels,
            flights: result.bookedFlights
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Booking failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveTrip = async () => {
    try {
      const response = await fetch('/api/trips/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData })
      });
      
      const result = await response.json();
      if (result.success && result.tripId) {
        updateTripData({ id: result.tripId });
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // Enhanced methods for modern features
  const getSmartRecommendations = async () => {
    if (!tripData.destination) return;
    
    try {
      const response = await fetch('/api/smart-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData })
      });
      
      const result = await response.json();
      if (result.success) {
        updateTripData({ smartRecommendations: result.recommendations });
      }
    } catch (error) {
      console.error('Smart recommendations failed:', error);
    }
  };

  const shareTrip = async (userIds: string[], permission: 'view' | 'edit') => {
    try {
      const response = await fetch('/api/trips/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: tripData.id, userIds, permission })
      });
      
      const result = await response.json();
      if (result.success) {
        const newPermissions = { ...tripData.collaboration?.permissions };
        userIds.forEach(userId => {
          newPermissions[userId] = permission;
        });
        
        updateTripData({
          collaboration: {
            ...tripData.collaboration,
            sharedWith: [...(tripData.collaboration?.sharedWith || []), ...userIds],
            permissions: newPermissions,
            comments: tripData.collaboration?.comments || []
          }
        });
      }
    } catch (error) {
      console.error('Trip sharing failed:', error);
    }
  };

  const addComment = async (message: string) => {
    const comment = {
      userId: 'current-user', // Replace with actual user ID
      message,
      timestamp: new Date().toISOString()
    };
    
    updateTripData({
      collaboration: {
        ...tripData.collaboration,
        sharedWith: tripData.collaboration?.sharedWith || [],
        permissions: tripData.collaboration?.permissions || {},
        comments: [...(tripData.collaboration?.comments || []), comment]
      }
    });
  };

  const optimizeItinerary = async () => {
    if (!tripData.itinerary) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/optimize-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData })
      });
      
      const result = await response.json();
      if (result.success) {
        updateTripData({
          itinerary: result.optimizedItinerary,
          expenses: result.optimizedExpenses
        });
      }
    } catch (error) {
      console.error('Itinerary optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackExpenses = (expense: { amount: number; category: string; description: string }) => {
    const currentTracking = tripData.expenses?.realTimeTracking;
    if (currentTracking) {
      const newSpent = currentTracking.spent + expense.amount;
      const newRemaining = (tripData.expenses?.total || 0) - newSpent;
      
      updateTripData({
        expenses: {
          ...tripData.expenses!,
          realTimeTracking: {
            spent: newSpent,
            remaining: newRemaining,
            alerts: newRemaining < (tripData.expenses?.total || 0) * 0.1 // Alert when 90% spent
          }
        }
      });
    }
  };

  const syncOfflineChanges = async () => {
    if (!hasUnsyncedChanges) return;
    
    try {
      const unsyncedData = localStorage.getItem('unsyncedTripChanges');
      if (unsyncedData) {
        const changes = JSON.parse(unsyncedData);
        await saveTrip();
        localStorage.removeItem('unsyncedTripChanges');
        setHasUnsyncedChanges(false);
        updateTripData({ lastSyncedAt: new Date().toISOString(), offlineChanges: false });
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const exportTrip = async (format: 'pdf' | 'ical' | 'json') => {
    try {
      const response = await fetch('/api/trips/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData, format })
      });
      
      const result = await response.json();
      return result.downloadUrl;
    } catch (error) {
      console.error('Export failed:', error);
      return '';
    }
  };

  const duplicateTrip = async () => {
    try {
      const duplicatedTrip = {
        ...tripData,
        id: undefined,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookingDetails: undefined
      };
      
      const response = await fetch('/api/trips/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData: duplicatedTrip })
      });
      
      const result = await response.json();
      return result.tripId;
    } catch (error) {
      console.error('Duplication failed:', error);
      return '';
    }
  };

  const cancelBooking = async () => {
    if (!tripData.bookingDetails?.reference) return false;
    
    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingReference: tripData.bookingDetails.reference })
      });
      
      const result = await response.json();
      if (result.success) {
        updateTripData({
          status: 'cancelled',
          bookingDetails: {
            ...tripData.bookingDetails,
            paymentStatus: 'refunded'
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cancellation failed:', error);
      return false;
    }
  };

  const getRealTimeUpdates = async () => {
    if (!tripData.id) return;
    
    try {
      const response = await fetch(`/api/trips/updates/${tripData.id}`);
      const result = await response.json();
      
      if (result.updates) {
        updateTripData(result.updates);
      }
    } catch (error) {
      console.error('Real-time updates failed:', error);
    }
  };

  const generateOfflineItinerary = () => {
    // Basic offline itinerary generation
    const days = Array.from({ length: tripData.duration }, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activities: [
        {
          time: '09:00',
          activity: `Explore ${tripData.destination}`,
          location: tripData.destination,
          duration: '3 hours'
        },
        {
          time: '14:00',
          activity: 'Local dining experience',
          location: tripData.destination,
          duration: '2 hours'
        }
      ]
    }));
    
    updateTripData({
      itinerary: { days },
      status: 'planning'
    });
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (hasUnsyncedChanges) {
        syncOfflineChanges();
      }
    };
    
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasUnsyncedChanges]);

  // Auto-save functionality with offline support
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (tripData.destination && tripData.sourceLocation) {
        if (!isOffline) {
          saveTrip();
        } else {
          // Save locally when offline
          localStorage.setItem('tripData', JSON.stringify(tripData));
        }
      }
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [tripData, isOffline]);

  // Real-time updates polling
  useEffect(() => {
    if (!tripData.id || isOffline) return;
    
    const interval = setInterval(getRealTimeUpdates, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [tripData.id, isOffline]);

  return (
    <TripContext.Provider value={{ 
      tripData, 
      updateTripData, 
      resetTripData, 
      isLoading, 
      setIsLoading,
      autoGenerateItinerary,
      bookTrip,
      saveTrip,
      // Enhanced features
      getSmartRecommendations,
      shareTrip,
      addComment,
      optimizeItinerary,
      trackExpenses,
      syncOfflineChanges,
      exportTrip,
      duplicateTrip,
      cancelBooking,
      getRealTimeUpdates,
      isOffline,
      hasUnsyncedChanges
    }}>
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
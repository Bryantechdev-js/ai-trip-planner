import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, currentLocation, preferences, realTimeFactors } = await req.json();

    const optimizedItinerary = await optimizeItinerary({
      userId,
      tripId,
      currentLocation,
      preferences,
      realTimeFactors
    });

    return NextResponse.json({
      success: true,
      optimizedItinerary,
      adjustments: optimizedItinerary.adjustments,
      estimatedSavings: optimizedItinerary.estimatedSavings
    });

  } catch (error) {
    console.error('Smart itinerary error:', error);
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
  }
}

async function optimizeItinerary(params: any) {
  const { userId, tripId, currentLocation, preferences, realTimeFactors } = params;
  
  const currentItinerary = await getCurrentItinerary(tripId);
  const factors = await analyzeRealTimeFactors(currentLocation, realTimeFactors);
  const optimizedRoute = await generateOptimizedRoute(currentItinerary, factors, preferences);
  const adjustments = calculateAdjustments(currentItinerary, optimizedRoute);
  
  await trackUserProgress(userId, tripId, currentLocation, optimizedRoute);
  
  return {
    originalItinerary: currentItinerary,
    optimizedItinerary: optimizedRoute,
    adjustments,
    estimatedSavings: calculateSavings(adjustments),
    autoTrackingEnabled: true,
    nextCheckpoint: optimizedRoute.nextCheckpoint
  };
}

async function getCurrentItinerary(tripId: string) {
  return {
    id: tripId,
    activities: [
      { id: 1, name: 'Museum Visit', time: '09:00', location: { lat: 40.7128, lng: -74.0060 }, duration: 120 },
      { id: 2, name: 'Lunch', time: '12:00', location: { lat: 40.7589, lng: -73.9851 }, duration: 60 },
      { id: 3, name: 'Park Walk', time: '14:00', location: { lat: 40.7829, lng: -73.9654 }, duration: 90 }
    ],
    route: [],
    totalDuration: 270,
    totalDistance: 15.2
  };
}

async function analyzeRealTimeFactors(currentLocation: any, factors: any) {
  const analysis = {
    traffic: await getTrafficData(currentLocation),
    weather: await getWeatherData(currentLocation),
    crowdLevels: await getCrowdData(currentLocation),
    events: await getLocalEvents(currentLocation),
    userBehavior: await analyzeUserBehavior(factors.userId)
  };
  
  return {
    ...analysis,
    riskLevel: calculateRiskLevel(analysis),
    recommendations: generateRecommendations(analysis)
  };
}

async function generateOptimizedRoute(itinerary: any, factors: any, preferences: any) {
  const optimized = { ...itinerary };
  
  if (factors.traffic.heavy) {
    optimized.activities = reorderForTraffic(itinerary.activities);
  }
  
  if (factors.crowdLevels.high) {
    optimized.activities = adjustForCrowds(optimized.activities);
  }
  
  if (factors.weather.adverse) {
    optimized.activities = weatherAdjustments(optimized.activities);
  }
  
  optimized.route = await calculateOptimalRoute(optimized.activities);
  optimized.nextCheckpoint = optimized.activities[0];
  
  return optimized;
}

async function trackUserProgress(userId: string, tripId: string, currentLocation: any, route: any) {
  const progress = {
    userId,
    tripId,
    currentLocation,
    route,
    timestamp: Date.now(),
    autoTracking: true,
    trackingMethods: ['gps', 'wifi', 'cellular']
  };
  
  await enableAutoTracking(userId, progress);
  return progress;
}

async function enableAutoTracking(userId: string, progress: any) {
  const trackingConfig = {
    gps: { enabled: true, interval: 30000 },
    wifi: { enabled: true, interval: 60000 },
    cellular: { enabled: true, interval: 120000 },
    bluetooth: { enabled: true, interval: 300000 }
  };
  
  return trackingConfig;
}

function calculateAdjustments(original: any, optimized: any) {
  return {
    timeAdjustments: optimized.activities.map((act: any, i: number) => ({
      activity: act.name,
      originalTime: original.activities[i]?.time,
      newTime: act.time,
      timeSaved: calculateTimeDifference(original.activities[i]?.time, act.time)
    })),
    routeChanges: {
      distanceReduction: original.totalDistance - optimized.totalDistance,
      timeReduction: original.totalDuration - optimized.totalDuration
    },
    costSavings: calculateCostSavings(original, optimized)
  };
}

async function getTrafficData(location: any) {
  return {
    heavy: Math.random() > 0.7,
    averageDelay: Math.floor(Math.random() * 30),
    alternativeRoutes: 3
  };
}

async function getWeatherData(location: any) {
  return {
    adverse: Math.random() > 0.8,
    temperature: 22,
    precipitation: Math.random() > 0.6,
    windSpeed: Math.floor(Math.random() * 20)
  };
}

async function getCrowdData(location: any) {
  return {
    high: Math.random() > 0.6,
    peakHours: ['12:00-14:00', '17:00-19:00'],
    alternativeVenues: 2
  };
}

async function getLocalEvents(location: any) {
  return [
    { name: 'Street Festival', impact: 'high', location: 'downtown' },
    { name: 'Concert', impact: 'medium', location: 'park' }
  ];
}

async function analyzeUserBehavior(userId: string) {
  return {
    preferredPace: 'moderate',
    interests: ['culture', 'food', 'nature'],
    timePreferences: 'morning_person',
    budgetSensitivity: 'medium'
  };
}

function calculateRiskLevel(analysis: any) {
  let risk = 0;
  if (analysis.traffic.heavy) risk += 2;
  if (analysis.weather.adverse) risk += 3;
  if (analysis.crowdLevels.high) risk += 1;
  
  return risk > 4 ? 'high' : risk > 2 ? 'medium' : 'low';
}

function generateRecommendations(analysis: any) {
  const recommendations = [];
  
  if (analysis.traffic.heavy) {
    recommendations.push('Consider alternative transportation');
  }
  if (analysis.weather.adverse) {
    recommendations.push('Move indoor activities earlier');
  }
  if (analysis.crowdLevels.high) {
    recommendations.push('Visit popular spots during off-peak hours');
  }
  
  return recommendations;
}

function reorderForTraffic(activities: any[]) {
  return activities.sort((a, b) => {
    return a.distance - b.distance;
  });
}

function adjustForCrowds(activities: any[]) {
  return activities.map(activity => {
    if (activity.crowdLevel === 'high') {
      const newTime = shiftToOffPeak(activity.time);
      return { ...activity, time: newTime };
    }
    return activity;
  });
}

function weatherAdjustments(activities: any[]) {
  return activities.map(activity => {
    if (activity.outdoor && Math.random() > 0.5) {
      return { ...activity, alternative: 'indoor_option' };
    }
    return activity;
  });
}

async function calculateOptimalRoute(activities: any[]) {
  return activities.map((activity, index) => ({
    step: index + 1,
    activity: activity.name,
    location: activity.location,
    estimatedTravelTime: index > 0 ? Math.floor(Math.random() * 30) + 10 : 0
  }));
}

function calculateTimeDifference(time1: string, time2: string) {
  return Math.floor(Math.random() * 30) - 15;
}

function calculateCostSavings(original: any, optimized: any) {
  return {
    transportation: Math.floor(Math.random() * 20),
    timeValue: Math.floor(Math.random() * 50),
    total: Math.floor(Math.random() * 70)
  };
}

function calculateSavings(adjustments: any) {
  return {
    timeSaved: adjustments.routeChanges.timeReduction,
    moneySaved: adjustments.costSavings.total,
    distanceSaved: adjustments.routeChanges.distanceReduction
  };
}

function shiftToOffPeak(time: string) {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 12 && hour <= 14) {
    return `${hour - 2}:00`;
  }
  return time;
}
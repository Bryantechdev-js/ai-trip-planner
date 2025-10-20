import { calculateDistance, estimateTravelTime, formatDuration, getRouteType } from '@/lib/mapUtils';

// Simple test functions for utility functions
export const testMapUtils = () => {
  // Test distance calculation (New York to Paris)
  const nyCoords = { lat: 40.7128, lng: -74.0060 };
  const parisCoords = { lat: 48.8566, lng: 2.3522 };
  
  const distance = calculateDistance(nyCoords, parisCoords);
  console.log('Distance NY to Paris:', Math.round(distance), 'km');
  
  const duration = estimateTravelTime(distance);
  console.log('Estimated travel time:', formatDuration(duration));
  
  const routeType = getRouteType(distance);
  console.log('Route type:', routeType);
  
  return {
    distance: Math.round(distance),
    duration: Math.round(duration * 10) / 10,
    formattedDuration: formatDuration(duration),
    type: routeType
  };
};

// Test with shorter distance (London to Paris)
export const testShortDistance = () => {
  const londonCoords = { lat: 51.5074, lng: -0.1278 };
  const parisCoords = { lat: 48.8566, lng: 2.3522 };
  
  const distance = calculateDistance(londonCoords, parisCoords);
  const duration = estimateTravelTime(distance);
  const routeType = getRouteType(distance);
  
  return {
    distance: Math.round(distance),
    duration: Math.round(duration * 10) / 10,
    formattedDuration: formatDuration(duration),
    type: routeType
  };
};
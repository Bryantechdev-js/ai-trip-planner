export interface Coordinates {
  lat: number
  lng: number
}

export interface RouteInfo {
  distance: number
  duration: number
  type: 'flight' | 'ground'
}

export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const estimateTravelTime = (distance: number): number => {
  // Estimate based on distance and transport type
  if (distance > 500) {
    // Flight + airport time
    return distance / 600 + 3 // 600 km/h flight speed + 3h airport time
  } else {
    // Ground transport
    return distance / 80 // 80 km/h average speed
  }
}

export const formatDuration = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const getRouteType = (distance: number): 'flight' | 'ground' => {
  return distance > 500 ? 'flight' : 'ground'
}

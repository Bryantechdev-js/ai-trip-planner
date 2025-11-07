import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const clientIP =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.ip || '127.0.0.1'

    // Use a free IP geolocation service
    const response = await fetch(
      `http://ip-api.com/json/${clientIP}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch IP location')
    }

    const data = await response.json()

    if (data.status === 'fail') {
      return NextResponse.json({ error: data.message || 'Failed to get location' }, { status: 400 })
    }

    return NextResponse.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.regionName,
      country: data.country,
      countryCode: data.countryCode,
      timezone: data.timezone,
      isp: data.isp,
      ip: data.query,
    })
  } catch (error) {
    console.error('IP location error:', error)

    // Fallback to approximate location based on timezone
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const fallbackLocation = getFallbackLocationByTimezone(timezone)

      return NextResponse.json({
        ...fallbackLocation,
        fallback: true,
        message: 'Using approximate location based on timezone',
      })
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Unable to determine location' }, { status: 500 })
    }
  }
}

function getFallbackLocationByTimezone(timezone: string) {
  const timezoneMap: {
    [key: string]: { latitude: number; longitude: number; city: string; country: string }
  } = {
    'America/New_York': {
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      country: 'United States',
    },
    'America/Los_Angeles': {
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      country: 'United States',
    },
    'Europe/London': {
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      country: 'United Kingdom',
    },
    'Europe/Paris': { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France' },
    'Asia/Tokyo': { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' },
    'Africa/Lagos': { latitude: 6.5244, longitude: 3.3792, city: 'Lagos', country: 'Nigeria' },
    'Africa/Douala': { latitude: 4.0511, longitude: 9.7679, city: 'Douala', country: 'Cameroon' },
    'Africa/Yaounde': { latitude: 3.848, longitude: 11.5021, city: 'Yaounde', country: 'Cameroon' },
  }

  return (
    timezoneMap[timezone] || {
      latitude: 0,
      longitude: 0,
      city: 'Unknown',
      country: 'Unknown',
    }
  )
}

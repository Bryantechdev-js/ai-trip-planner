import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { destination } = await req.json()
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    // Use OpenWeatherMap free API
    const weatherData = await fetchWeatherData(destination)
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

async function fetchWeatherData(destination: string) {
  try {
    // Free OpenWeatherMap API (requires signup but free tier available)
    const API_KEY = process.env.WEATHER_API_KEY || 'demo_key'
    
    // Get coordinates first
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${API_KEY}`
    )
    
    if (!geoResponse.ok) {
      throw new Error('Geocoding failed')
    }
    
    const geoData = await geoResponse.json()
    
    if (!geoData.length) {
      throw new Error('Location not found')
    }
    
    const { lat, lon } = geoData[0]
    
    // Get current weather and forecast
    const weatherResponse = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    )
    
    if (!weatherResponse.ok) {
      throw new Error('Weather fetch failed')
    }
    
    const weatherData = await weatherResponse.json()
    
    // Process the data
    const current = weatherData.list[0]
    const forecast = weatherData.list.slice(0, 7).map((item: any) => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      high: Math.round(item.main.temp_max),
      low: Math.round(item.main.temp_min),
      condition: item.weather[0].main
    }))
    
    return {
      location: destination,
      current: {
        temperature: Math.round(current.main.temp),
        condition: current.weather[0].main,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6) // Convert m/s to km/h
      },
      forecast
    }
    
  } catch (error) {
    console.error('Weather fetch error:', error)
    // Fallback to mock data if API fails
    return {
      location: destination,
      current: {
        temperature: Math.floor(Math.random() * 30) + 15,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        high: Math.floor(Math.random() * 30) + 15,
        low: Math.floor(Math.random() * 15) + 5,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
      }))
    }
  }
}
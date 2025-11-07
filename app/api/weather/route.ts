import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { destination } = await req.json();
        
        if (!destination) {
            return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
        }

        // Using OpenWeatherMap API (you'll need to add OPENWEATHER_API_KEY to .env.local)
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
            // Return mock data if no API key
            return NextResponse.json(getMockWeatherData(destination));
        }

        // Get coordinates first
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`
        );
        
        if (!geoResponse.ok) {
            return NextResponse.json(getMockWeatherData(destination));
        }
        
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            return NextResponse.json(getMockWeatherData(destination));
        }
        
        const { lat, lon } = geoData[0];
        
        // Get current weather and forecast
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            return NextResponse.json(getMockWeatherData(destination));
        }
        
        const [currentData, forecastData] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json()
        ]);
        
        return NextResponse.json({
            destination,
            current: {
                temperature: Math.round(currentData.main.temp),
                description: currentData.weather[0].description,
                icon: currentData.weather[0].icon,
                humidity: currentData.main.humidity,
                windSpeed: currentData.wind.speed,
                feelsLike: Math.round(currentData.main.feels_like)
            },
            forecast: forecastData.list.slice(0, 5).map((item: any) => ({
                date: new Date(item.dt * 1000).toLocaleDateString(),
                temperature: Math.round(item.main.temp),
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }))
        });
        
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}

function getMockWeatherData(destination: string) {
    return {
        destination,
        current: {
            temperature: 25,
            description: 'partly cloudy',
            icon: '02d',
            humidity: 65,
            windSpeed: 3.2,
            feelsLike: 27
        },
        forecast: [
            { date: new Date().toLocaleDateString(), temperature: 25, description: 'partly cloudy', icon: '02d' },
            { date: new Date(Date.now() + 86400000).toLocaleDateString(), temperature: 27, description: 'sunny', icon: '01d' },
            { date: new Date(Date.now() + 172800000).toLocaleDateString(), temperature: 23, description: 'light rain', icon: '10d' },
            { date: new Date(Date.now() + 259200000).toLocaleDateString(), temperature: 26, description: 'cloudy', icon: '03d' },
            { date: new Date(Date.now() + 345600000).toLocaleDateString(), temperature: 28, description: 'sunny', icon: '01d' }
        ]
    };
}
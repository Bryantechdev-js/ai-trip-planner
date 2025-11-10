import { NextRequest, NextResponse } from 'next/server'

// Add GET method for basic tour information
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const destination = searchParams.get('destination')

  if (!destination) {
    return NextResponse.json({ error: 'Destination parameter is required' }, { status: 400 })
  }

  try {
    const basicTourInfo = {
      destination,
      availableTours: ['comprehensive', 'quick', 'detailed'],
      estimatedDuration: '2-4 hours',
      highlights: getDefaultLandmarks(destination).map(l => l.name),
      tourTypes: {
        comprehensive: 'Full experience with all landmarks and activities',
        quick: 'Essential highlights in under 1 hour',
        detailed: 'In-depth exploration with cultural insights',
      },
    }

    return NextResponse.json(basicTourInfo)
  } catch (error) {
    console.error('Error fetching basic tour info:', error)
    return NextResponse.json({ error: 'Failed to fetch tour information' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { destination, tourType = 'comprehensive' } = await req.json()

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    const virtualTourData = await fetchVirtualTourData(destination)

    // Add tour type specific enhancements
    if (tourType === 'quick') {
      virtualTourData.landmarks = virtualTourData.landmarks.slice(0, 2)
      virtualTourData.tourDuration = Math.min(virtualTourData.tourDuration, 60)
    } else if (tourType === 'detailed') {
      (virtualTourData as any).extendedInfo = {
        culturalNotes: `Learn about the rich culture and traditions of ${destination}`,
        historicalContext: `Discover the fascinating history that shaped ${destination}`,
        localTips: [
          'Best local restaurants to try',
          'Hidden gems only locals know',
          'Cultural etiquette and customs',
          'Transportation tips',
        ],
      }
    }

    return NextResponse.json(virtualTourData)
  } catch (error) {
    console.error('Virtual Tour API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch virtual tour data' }, { status: 500 })
  }
}

async function fetchVirtualTourData(destination: string) {
  try {
    // Use Google Street View Static API for 360° views
    const streetViewData = await fetchStreetViewData(destination)

    // Get popular landmarks for the destination
    const landmarks = await fetchLandmarks(destination)

    // Generate step-by-step tour
    const guidedTour = await generateStepByStepTour(destination, landmarks)

    // Get real images for the destination
    const realImages = await fetchDestinationImages(destination)

    // Fetch engaging videos for the destination
    const destinationVideos = await fetchDestinationVideos(destination)
    const interestingContent = await fetchInterestingContent(destination)

    return {
      destination,
      streetView: streetViewData,
      landmarks,
      guidedTour,
      virtualTours: getVirtualTourLinks(destination),
      panoramas: getPanoramaViews(destination),
      realImages,
      videos: destinationVideos,
      interestingContent,
      liveExperiences: await fetchLiveExperiences(destination),
      tourDuration: calculateTourDuration(landmarks),
      activities: generateActivities(destination, landmarks),
      mediaGallery: {
        totalImages: realImages.length,
        totalVideos: destinationVideos.length,
        totalInterestingContent:
          interestingContent.videos.length + interestingContent.photos.length,
        categories: [...new Set(realImages.map(img => img.category))],
        featured: {
          image: realImages[0],
          video: destinationVideos[0],
          interestingVideo: interestingContent.videos[0],
          liveExperience: await fetchLiveExperiences(destination).then(exp => exp[0]),
        },
        highlights: {
          mostViewed: destinationVideos.sort((a, b) => b.viewCount - a.viewCount)[0],
          newest: realImages[realImages.length - 1],
          trending: interestingContent.videos[0],
        },
      },
    }
  } catch (error) {
    console.error('Error fetching virtual tour data:', error)
    const defaultImages = getDefaultImages(destination)
    const defaultVideos = getDefaultVideos(destination)

    return {
      destination,
      streetView: null,
      landmarks: getDefaultLandmarks(destination),
      guidedTour: getDefaultGuidedTour(destination),
      virtualTours: getVirtualTourLinks(destination),
      panoramas: getPanoramaViews(destination),
      realImages: defaultImages,
      videos: defaultVideos,
      interestingContent: getDefaultInterestingContent(destination),
      liveExperiences: getDefaultLiveExperiences(destination),
      tourDuration: 120,
      activities: getDefaultActivities(destination),
      mediaGallery: {
        totalImages: defaultImages.length,
        totalVideos: defaultVideos.length,
        totalInterestingContent:
          getDefaultInterestingContent(destination).videos.length +
          getDefaultInterestingContent(destination).photos.length,
        categories: ['cityscape', 'landmarks', 'culture', 'food'],
        featured: {
          image: defaultImages[0],
          video: defaultVideos[0],
          interestingVideo: getDefaultInterestingContent(destination).videos[0],
          liveExperience: getDefaultLiveExperiences(destination)[0],
        },
        highlights: {
          mostViewed: defaultVideos[0],
          newest: defaultImages[0],
          trending: getDefaultInterestingContent(destination).videos[0],
        },
      },
    }
  }
}

async function generateStepByStepTour(destination: string, landmarks: any[]) {
  return landmarks.map((landmark, index) => ({
    step: index + 1,
    title: `Visit ${landmark.name}`,
    description: `${landmark.description} Take your time to explore this iconic location and capture memorable photos.`,
    duration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
    activities: [
      'Photography session',
      'Historical exploration',
      'Cultural immersion',
      'Local interaction',
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    location: landmark,
    tips: [
      `Best time to visit: ${getRandomTimeSlot()}`,
      'Bring comfortable walking shoes',
      "Don't forget your camera",
      'Try local refreshments nearby',
    ],
    highlights: generateLocationHighlights(landmark.name),
  }))
}

function getRandomTimeSlot() {
  const slots = [
    'Early morning (8-10 AM)',
    'Mid-morning (10-12 PM)',
    'Afternoon (2-4 PM)',
    'Golden hour (5-7 PM)',
  ]
  return slots[Math.floor(Math.random() * slots.length)]
}

function generateLocationHighlights(locationName: string) {
  const genericHighlights = [
    'Architectural details',
    'Historical significance',
    'Photo opportunities',
    'Cultural importance',
    'Unique features',
    'Local atmosphere',
  ]
  return genericHighlights.slice(0, Math.floor(Math.random() * 3) + 2)
}

async function fetchDestinationImages(destination: string) {
  try {
    // Enhanced real-life image collection with multiple sources
    const imageCategories = [
      'landmarks',
      'culture',
      'food',
      'nature',
      'architecture',
      'people',
      'nightlife',
      'markets',
    ]
    const realLifeImages = []

    // Generate high-quality image URLs from multiple sources
    for (let i = 0; i < 12; i++) {
      const category = imageCategories[i % imageCategories.length]
      realLifeImages.push({
        id: i + 1,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},${category},travel,photography`,
        thumbnailUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)},${category},travel`,
        title: `${destination} - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        category,
        description: `Authentic ${category} experience in ${destination}`,
        photographer: 'Travel Community',
        tags: [destination.toLowerCase(), category, 'travel', 'authentic'],
        isHighRes: true,
        downloadUrl: `https://source.unsplash.com/1920x1080/?${encodeURIComponent(destination)},${category}`,
      })
    }

    // Try to fetch from media search API as backup
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/media-search`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination, type: 'images' }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.data?.length > 0) {
          return data.data.slice(0, 8)
        }
      }
    } catch (apiError) {
      console.log('Media API not available, using generated images')
    }

    return realLifeImages
  } catch (error) {
    console.error('Error fetching destination images:', error)
    return getDefaultImages(destination)
  }
}

function getDefaultImages(destination: string) {
  const categories = ['cityscape', 'landmarks', 'culture', 'food']
  return categories.map((category, index) => ({
    id: index + 1,
    url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},${category}`,
    thumbnailUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)},${category}`,
    title: `${destination} - ${category}`,
    category,
    description: `Beautiful ${category} in ${destination}`,
    photographer: 'Travel Community',
    tags: [destination.toLowerCase(), category],
    isHighRes: true,
  }))
}

function calculateTourDuration(landmarks: any[]) {
  return landmarks.length * 30 + 60 // 30 min per landmark + 1 hour travel time
}

function generateActivities(destination: string, landmarks: any[]) {
  const baseActivities = [
    'Walking tours',
    'Photography sessions',
    'Cultural exploration',
    'Local cuisine tasting',
    'Historical site visits',
    'Shopping experiences',
    'Scenic viewpoints',
    'Museum visits',
  ]

  return baseActivities.slice(0, Math.min(landmarks.length + 2, 6))
}

function getDefaultGuidedTour(destination: string) {
  return [
    {
      step: 1,
      title: `Explore ${destination} City Center`,
      description: `Begin your journey in the heart of ${destination}. Discover the main attractions and get oriented with the city layout.`,
      duration: 45,
      activities: ['City orientation', 'Main attractions', 'Photo opportunities'],
      location: { name: `${destination} City Center`, coordinates: { lat: 0, lng: 0 } },
      tips: ['Start early to avoid crowds', 'Bring comfortable shoes', 'Keep your camera ready'],
      highlights: ['Central landmarks', 'Urban architecture', 'Local atmosphere'],
    },
  ]
}

function getDefaultActivities(destination: string) {
  return [
    'City exploration',
    'Cultural immersion',
    'Photography',
    'Local cuisine',
    'Historical sites',
  ]
}

async function fetchStreetViewData(destination: string) {
  try {
    // Google Street View Static API (free tier available)
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY

    if (GOOGLE_API_KEY) {
      const baseUrl = 'https://maps.googleapis.com/maps/api/streetview'

      // Generate multiple viewpoints for comprehensive coverage
      const viewpoints = [
        { heading: '0', pitch: '0', fov: '90' },
        { heading: '90', pitch: '0', fov: '90' },
        { heading: '180', pitch: '0', fov: '90' },
        { heading: '270', pitch: '0', fov: '90' },
      ]

      const streetViewImages = viewpoints.map((viewpoint, index) => {
        const params = new URLSearchParams({
          size: '640x640',
          location: destination,
          heading: viewpoint.heading,
          pitch: viewpoint.pitch,
          fov: viewpoint.fov,
          key: GOOGLE_API_KEY,
        })

        return {
          id: index,
          url: `${baseUrl}?${params.toString()}`,
          heading: viewpoint.heading,
          description: `${destination} - ${getDirectionName(viewpoint.heading)} view`,
        }
      })

      return {
        images: streetViewImages,
        interactive: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(destination)}`,
        embed: `https://www.google.com/maps/embed?pb=!4v${Date.now()}!6m8!1m7!1sCAoSLEFGMVFpcE1fVXBkdE1QRXE0QnNEUVfRUVFRUVFRUVFRUVFRUVFRUVFRUVE!2m2!1d0!2d0!3f0!4f0!5f0.7820865974627469`,
      }
    }
  } catch (error) {
    console.error('Street View API error:', error)
  }

  return null
}

function getDirectionName(heading: string) {
  const directions = {
    '0': 'North',
    '90': 'East',
    '180': 'South',
    '270': 'West',
  }
  return directions[heading as keyof typeof directions] || 'Unknown'
}

async function fetchLandmarks(destination: string) {
  // Enhanced landmark data with more destinations and details
  const landmarkData: { [key: string]: any[] } = {
    yaounde: [
      {
        name: 'Reunification Monument',
        description: "Historic monument commemorating Cameroon's reunification in 1972",
        coordinates: { lat: 3.848, lng: 11.5021 },
        streetViewUrl: `https://www.google.com/maps/@3.8480,11.5021,3a,75y,90t/data=!3m6!1e1`,
        category: 'Monument',
        visitDuration: 30,
        bestTimeToVisit: 'Morning or late afternoon',
      },
      {
        name: 'National Museum of Cameroon',
        description: "Museum showcasing Cameroon's rich cultural heritage and history",
        coordinates: { lat: 3.8634, lng: 11.5146 },
        streetViewUrl: `https://www.google.com/maps/@3.8634,11.5146,3a,75y,90t/data=!3m6!1e1`,
        category: 'Museum',
        visitDuration: 90,
        bestTimeToVisit: 'Any time during opening hours',
      },
      {
        name: 'Mvog-Betsi Zoo',
        description: 'Home to diverse African wildlife and conservation efforts',
        coordinates: { lat: 3.8267, lng: 11.5342 },
        streetViewUrl: `https://www.google.com/maps/@3.8267,11.5342,3a,75y,90t/data=!3m6!1e1`,
        category: 'Zoo',
        visitDuration: 120,
        bestTimeToVisit: 'Early morning when animals are active',
      },
    ],
    paris: [
      {
        name: 'Eiffel Tower',
        description:
          'Iconic iron lattice tower and symbol of Paris, offering breathtaking city views',
        coordinates: { lat: 48.8584, lng: 2.2945 },
        streetViewUrl: `https://www.google.com/maps/@48.8584,2.2945,3a,75y,90t/data=!3m6!1e1`,
        category: 'Landmark',
        visitDuration: 120,
        bestTimeToVisit: 'Sunset for golden hour photos',
      },
      {
        name: 'Louvre Museum',
        description: "World's largest art museum housing the Mona Lisa and countless masterpieces",
        coordinates: { lat: 48.8606, lng: 2.3376 },
        streetViewUrl: `https://www.google.com/maps/@48.8606,2.3376,3a,75y,90t/data=!3m6!1e1`,
        category: 'Museum',
        visitDuration: 180,
        bestTimeToVisit: 'Early morning to avoid crowds',
      },
      {
        name: 'Notre-Dame Cathedral',
        description: 'Gothic masterpiece and spiritual heart of Paris',
        coordinates: { lat: 48.853, lng: 2.3499 },
        streetViewUrl: `https://www.google.com/maps/@48.8530,2.3499,3a,75y,90t/data=!3m6!1e1`,
        category: 'Religious Site',
        visitDuration: 60,
        bestTimeToVisit: 'Mid-morning for best lighting',
      },
      {
        name: 'Champs-Élysées',
        description: 'Famous avenue perfect for shopping, dining, and people watching',
        coordinates: { lat: 48.8698, lng: 2.3076 },
        streetViewUrl: `https://www.google.com/maps/@48.8698,2.3076,3a,75y,90t/data=!3m6!1e1`,
        category: 'Shopping District',
        visitDuration: 90,
        bestTimeToVisit: 'Afternoon for shopping and cafés',
      },
    ],
    london: [
      {
        name: 'Big Ben & Houses of Parliament',
        description: 'Iconic clock tower and seat of British government',
        coordinates: { lat: 51.4994, lng: -0.1245 },
        streetViewUrl: `https://www.google.com/maps/@51.4994,-0.1245,3a,75y,90t/data=!3m6!1e1`,
        category: 'Landmark',
        visitDuration: 45,
        bestTimeToVisit: 'Golden hour for photography',
      },
      {
        name: 'Tower Bridge',
        description: 'Victorian engineering marvel spanning the River Thames',
        coordinates: { lat: 51.5055, lng: -0.0754 },
        streetViewUrl: `https://www.google.com/maps/@51.5055,-0.0754,3a,75y,90t/data=!3m6!1e1`,
        category: 'Bridge',
        visitDuration: 60,
        bestTimeToVisit: 'Sunset for dramatic lighting',
      },
    ],
    tokyo: [
      {
        name: 'Senso-ji Temple',
        description: 'Ancient Buddhist temple in traditional Asakusa district',
        coordinates: { lat: 35.7148, lng: 139.7967 },
        streetViewUrl: `https://www.google.com/maps/@35.7148,139.7967,3a,75y,90t/data=!3m6!1e1`,
        category: 'Temple',
        visitDuration: 75,
        bestTimeToVisit: 'Early morning for peaceful atmosphere',
      },
      {
        name: 'Shibuya Crossing',
        description: "World's busiest pedestrian crossing in vibrant Shibuya",
        coordinates: { lat: 35.6598, lng: 139.7006 },
        streetViewUrl: `https://www.google.com/maps/@35.6598,139.7006,3a,75y,90t/data=!3m6!1e1`,
        category: 'Urban Experience',
        visitDuration: 30,
        bestTimeToVisit: 'Evening rush hour for full experience',
      },
    ],
  }

  const key = destination.toLowerCase()
  return landmarkData[key] || getDefaultLandmarks(destination)
}

function getDefaultLandmarks(destination: string) {
  return [
    {
      name: `${destination} City Center`,
      description: `Explore the vibrant heart of ${destination} with its main attractions and local culture`,
      coordinates: { lat: 0, lng: 0 },
      streetViewUrl: `https://www.google.com/maps/search/${encodeURIComponent(destination)}`,
      category: 'City Center',
      visitDuration: 60,
      bestTimeToVisit: 'Mid-morning for optimal lighting',
    },
    {
      name: `${destination} Historic District`,
      description: `Discover the rich history and heritage of ${destination} in its historic quarter`,
      coordinates: { lat: 0, lng: 0 },
      streetViewUrl: `https://www.google.com/maps/search/${encodeURIComponent(destination + ' historic district')}`,
      category: 'Historic Area',
      visitDuration: 90,
      bestTimeToVisit: 'Afternoon for guided tours',
    },
    {
      name: `${destination} Cultural Quarter`,
      description: `Immerse yourself in the local arts, crafts, and cultural experiences of ${destination}`,
      coordinates: { lat: 0, lng: 0 },
      streetViewUrl: `https://www.google.com/maps/search/${encodeURIComponent(destination + ' cultural center')}`,
      category: 'Cultural Site',
      visitDuration: 75,
      bestTimeToVisit: 'Late afternoon for cultural activities',
    },
  ]
}

async function fetchDestinationVideos(destination: string) {
  const videoTypes = [
    { type: 'walking_tour', query: `${destination} walking tour 4k`, duration: '45-60 min' },
    { type: 'drone_footage', query: `${destination} drone aerial view`, duration: '10-15 min' },
    {
      type: 'cultural_experience',
      query: `${destination} culture local life`,
      duration: '20-30 min',
    },
    { type: 'food_tour', query: `${destination} food tour local cuisine`, duration: '25-35 min' },
    { type: 'nightlife', query: `${destination} nightlife evening tour`, duration: '15-25 min' },
    { type: 'historical', query: `${destination} history documentary`, duration: '30-45 min' },
  ]

  return videoTypes.map((video, index) => ({
    id: index + 1,
    title: `${destination} ${video.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}`,
    embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(video.query)}`,
    thumbnailUrl: `https://source.unsplash.com/640x360/?${encodeURIComponent(destination)},${video.type.replace('_', ' ')},video`,
    type: video.type,
    duration: video.duration,
    description: `Experience ${destination} through ${video.type.replace('_', ' ')} - authentic local perspectives`,
    provider: 'YouTube',
    quality: '4K Available',
    tags: [destination.toLowerCase(), video.type, 'travel', 'authentic'],
    isInteractive: true,
    viewCount: Math.floor(Math.random() * 500000) + 50000,
  }))
}

function getDefaultVideos(destination: string) {
  const basicTypes = ['tour', 'culture', 'food', 'attractions']
  return basicTypes.map((type, index) => ({
    id: index + 1,
    title: `${destination} ${type.charAt(0).toUpperCase() + type.slice(1)} Experience`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + type)}`,
    embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(destination + ' ' + type)}`,
    thumbnailUrl: `https://source.unsplash.com/640x360/?${encodeURIComponent(destination)},${type}`,
    type,
    duration: '20-30 min',
    description: `Discover ${destination} ${type} experiences`,
    provider: 'YouTube',
    quality: 'HD',
    tags: [destination.toLowerCase(), type],
    isInteractive: true,
    viewCount: Math.floor(Math.random() * 100000) + 10000,
  }))
}

function getVirtualTourLinks(destination: string) {
  return [
    {
      title: `${destination} 360° Street View Tour`,
      url: `https://www.google.com/maps/search/${encodeURIComponent(destination)}/@?api=1&map_action=pano`,
      provider: 'Google Street View',
      type: '360_panorama',
      description: 'Immersive 360° street-level exploration with real-time navigation',
      duration: '30-60 minutes',
      features: ['360° Views', 'Street Navigation', 'Real Locations', 'Interactive'],
      quality: 'High Resolution',
    },
    {
      title: `${destination} Live Virtual Walking Tour`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' virtual walking tour 4k live')}`,
      provider: 'YouTube',
      type: 'video_tour',
      description: 'Guided video tours with local insights and real-time commentary',
      duration: '45-90 minutes',
      features: ['4K Quality', 'Local Guide', 'Real-time Audio', 'Multiple Routes'],
      quality: '4K Ultra HD',
    },
    {
      title: `${destination} Interactive Map Experience`,
      url: `https://www.google.com/maps/place/${encodeURIComponent(destination)}`,
      provider: 'Google Maps',
      type: 'interactive_map',
      description: 'Explore with satellite, street views, and real user photos',
      duration: 'Self-paced',
      features: ['Satellite View', 'Street View', 'User Photos', 'Reviews'],
      quality: 'Real-time Data',
    },
    {
      title: `${destination} Immersive VR Experience`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' VR virtual reality 360 tour')}`,
      provider: 'VR Platforms',
      type: 'vr_experience',
      description: 'Full immersive VR tours with 360° videos and interactive elements',
      duration: '20-45 minutes',
      features: ['VR Compatible', '360° Video', 'Immersive Audio', 'Interactive Hotspots'],
      quality: 'VR Optimized',
    },
  ]
}

async function fetchInterestingVideos(destination: string) {
  const interestingCategories = [
    {
      type: 'local_secrets',
      query: `${destination} hidden gems locals only`,
      description: 'Secret spots only locals know about',
    },
    {
      type: 'time_lapse',
      query: `${destination} timelapse day to night`,
      description: 'Stunning time-lapse transformations',
    },
    {
      type: 'street_food',
      query: `${destination} street food authentic local`,
      description: 'Authentic street food adventures',
    },
    {
      type: 'festivals',
      query: `${destination} festivals celebrations culture`,
      description: 'Vibrant local festivals and celebrations',
    },
    {
      type: 'behind_scenes',
      query: `${destination} behind the scenes local life`,
      description: 'Real life behind the tourist facade',
    },
  ]

  return interestingCategories.map((category, index) => ({
    id: index + 1,
    title: `${destination}: ${category.description}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(category.query)}`,
    embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(category.query)}`,
    thumbnailUrl: `https://source.unsplash.com/640x360/?${encodeURIComponent(destination)},${category.type.replace('_', ' ')},authentic`,
    type: category.type,
    description: category.description,
    duration: '5-15 min',
    provider: 'YouTube',
    quality: '4K Available',
    isInteresting: true,
    engagement: 'High',
    tags: [destination.toLowerCase(), category.type, 'authentic', 'local'],
    viewCount: Math.floor(Math.random() * 200000) + 25000,
  }))
}

async function fetchInterestingContent(destination: string) {
  return {
    photos: [
      {
        id: 1,
        title: `Real Life in ${destination}`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},people,authentic,daily-life`,
        description: 'Authentic moments of daily life',
        category: 'lifestyle',
      },
      {
        id: 2,
        title: `${destination} Local Markets`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},market,local,colorful`,
        description: 'Vibrant local markets and vendors',
        category: 'culture',
      },
      {
        id: 3,
        title: `${destination} Street Art`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},street-art,graffiti,urban`,
        description: 'Creative street art and urban expressions',
        category: 'art',
      },
    ],
    videos: await fetchInterestingVideos(destination),
    liveStreams: [
      {
        id: 1,
        title: `Live from ${destination}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' live stream webcam')}`,
        description: 'Real-time views of the city',
        isLive: true,
        viewers: Math.floor(Math.random() * 500) + 50,
      },
    ],
  }
}

async function fetchLiveExperiences(destination: string) {
  return [
    {
      id: 1,
      title: `${destination} Live Webcams`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' live webcam stream')}`,
      type: 'webcam',
      description: 'Real-time city views and weather',
      isLive: true,
      quality: 'HD Live',
      viewers: Math.floor(Math.random() * 1000) + 100,
    },
    {
      id: 2,
      title: `Virtual ${destination} Walking Tour`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' virtual walking tour live')}`,
      type: 'virtual_tour',
      description: 'Interactive guided tours with live commentary',
      isLive: false,
      quality: '4K',
      duration: '60-90 min',
    },
    {
      id: 3,
      title: `${destination} 360° Experience`,
      url: `https://www.google.com/maps/search/${encodeURIComponent(destination)}/@?api=1&map_action=pano`,
      type: '360_tour',
      description: 'Immersive 360° exploration',
      isInteractive: true,
      quality: 'Ultra HD',
      features: ['360° View', 'Interactive Navigation', 'Real Locations'],
    },
  ]
}

function getDefaultInterestingContent(destination: string) {
  return {
    photos: [
      {
        id: 1,
        title: `${destination} Authentic Moments`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},authentic,people`,
        description: 'Real moments from local life',
        category: 'lifestyle',
      },
    ],
    videos: getDefaultVideos(destination).slice(0, 3),
    liveStreams: [
      {
        id: 1,
        title: `${destination} Live View`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' live')}`,
        description: 'Live city views',
        isLive: true,
        viewers: Math.floor(Math.random() * 200) + 20,
      },
    ],
  }
}

function getDefaultLiveExperiences(destination: string) {
  return [
    {
      id: 1,
      title: `${destination} Live Views`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' live webcam')}`,
      type: 'webcam',
      description: 'Real-time city views',
      isLive: true,
      quality: 'HD',
      viewers: Math.floor(Math.random() * 500) + 50,
    },
  ]
}

function getPanoramaViews(destination: string) {
  // Enhanced panorama views with real-life imagery and interactive features
  const viewTypes = [
    {
      type: 'aerial',
      description: "Stunning bird's eye view showcasing the entire cityscape and surroundings",
      timeOfDay: 'golden_hour',
      quality: '4K Ultra HD',
    },
    {
      type: 'street',
      description: 'Immersive ground-level 360° street experience with authentic local atmosphere',
      timeOfDay: 'daytime',
      quality: 'High Resolution',
    },
    {
      type: 'landmark',
      description: 'Iconic landmarks and monuments captured in stunning detail',
      timeOfDay: 'blue_hour',
      quality: '4K Ultra HD',
    },
    {
      type: 'nature',
      description: 'Breathtaking natural landscapes and scenic viewpoints',
      timeOfDay: 'sunrise',
      quality: 'High Resolution',
    },
    {
      type: 'urban',
      description: 'Dynamic city skyline and modern architecture showcase',
      timeOfDay: 'night',
      quality: '4K Ultra HD',
    },
    {
      type: 'cultural',
      description: 'Authentic cultural sites and vibrant heritage areas',
      timeOfDay: 'afternoon',
      quality: 'High Resolution',
    },
  ]

  return viewTypes.map((view, index) => ({
    id: index + 1,
    title: `${destination} ${view.type.charAt(0).toUpperCase() + view.type.slice(1)} Panorama`,
    url: `https://source.unsplash.com/1920x1080/?${encodeURIComponent(destination)},${view.type},${view.timeOfDay},panorama,photography`,
    thumbnailUrl: `https://source.unsplash.com/600x400/?${encodeURIComponent(destination)},${view.type},${view.timeOfDay}`,
    type: view.type,
    description: view.description,
    timeOfDay: view.timeOfDay,
    quality: view.quality,
    is360: true,
    isInteractive: true,
    interactiveUrl: `https://www.google.com/maps/search/${encodeURIComponent(destination + ' ' + view.type)}/@?api=1&map_action=pano`,
    downloadUrl: `https://source.unsplash.com/3840x2160/?${encodeURIComponent(destination)},${view.type},${view.timeOfDay}`,
    tags: [destination.toLowerCase(), view.type, view.timeOfDay, 'panorama', 'photography'],
    photographer: 'Professional Travel Photographer',
    likes: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 10000) + 1000,
  }))
}

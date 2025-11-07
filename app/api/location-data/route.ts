import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { destination } = await req.json()

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    const locationData = await fetchLocationData(destination)
    return NextResponse.json(locationData)
  } catch (error) {
    console.error('Location API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 })
  }
}

async function fetchLocationData(destination: string) {
  try {
    // Get Wikipedia data for destination info
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destination)}`
    )

    let wikiData = null
    if (wikiResponse.ok) {
      wikiData = await wikiResponse.json()
    }

    return {
      destination,
      info: wikiData
        ? {
            title: wikiData.title,
            description: wikiData.extract,
            thumbnail: wikiData.thumbnail?.source,
          }
        : null,
      attractions: getLocalAttractions(destination),
      cuisine: getLocalCuisine(destination),
      culture: getCulturalInfo(destination),
      images: getLocationImages(destination),
    }
  } catch (error) {
    console.error('Error fetching location data:', error)
    return {
      destination,
      info: null,
      attractions: getLocalAttractions(destination),
      cuisine: getLocalCuisine(destination),
      culture: getCulturalInfo(destination),
      images: getLocationImages(destination),
    }
  }
}

function getLocalAttractions(destination: string) {
  const attractions: { [key: string]: string[] } = {
    yaounde: [
      'Reunification Monument',
      'National Museum of Cameroon',
      'Mount Febe',
      'Mvog-Betsi Zoo',
      'Blackitude Museum',
      'Cathedral of Our Lady of Victories',
      'Central Market',
      'Unity Palace',
    ],
    cameroon: [
      'Mount Cameroon',
      'Waza National Park',
      'Limbe Botanic Garden',
      'Kribi Beach',
      'Dja Faunal Reserve',
      'Foumban Royal Palace',
      'Ring Road (Northwest Region)',
      'Bamenda Highlands',
    ],
  }

  const key = destination.toLowerCase()
  return (
    attractions[key] ||
    attractions['cameroon'] || [
      'City Center',
      'Local Markets',
      'Cultural Sites',
      'Historical Landmarks',
    ]
  )
}

function getLocalCuisine(destination: string) {
  const cuisine: { [key: string]: string[] } = {
    yaounde: [
      'Ndolé (bitter leaves with groundnuts)',
      'Poulet DG (chicken with plantains)',
      'Koki (steamed black-eyed peas)',
      'Fufu with various soups',
      'Grilled fish with plantains',
      'Puff-puff (sweet doughnuts)',
      'Palm wine',
    ],
    cameroon: [
      'Jollof Rice',
      'Pepper Soup',
      'Bobolo (cassava bread)',
      'Suya (grilled meat)',
      'Plantain chips',
      'Groundnut soup',
    ],
  }

  const key = destination.toLowerCase()
  return (
    cuisine[key] ||
    cuisine['cameroon'] || ['Local traditional dishes', 'Fresh seafood', 'Tropical fruits']
  )
}

function getCulturalInfo(destination: string) {
  const culture: { [key: string]: any } = {
    yaounde: {
      languages: ['French', 'English', 'Ewondo', 'Bulu'],
      currency: 'Central African CFA franc (XAF)',
      timezone: 'WAT (UTC+1)',
      tips: [
        'French is the primary language',
        'Respect local customs and traditions',
        'Dress modestly when visiting religious sites',
        'Bargaining is common in markets',
      ],
    },
    cameroon: {
      languages: ['French', 'English', 'Local languages'],
      currency: 'Central African CFA franc (XAF)',
      timezone: 'WAT (UTC+1)',
      tips: [
        'Cameroon has both French and English regions',
        'Rich cultural diversity with over 200 ethnic groups',
        'Respect for elders is very important',
      ],
    },
  }

  const key = destination.toLowerCase()
  return culture[key] || culture['cameroon']
}

function getLocationImages(destination: string) {
  // Return placeholder image URLs - in production, integrate with image APIs
  return [
    `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},city`,
    `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},landscape`,
    `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},culture`,
    `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},food`,
  ]
}

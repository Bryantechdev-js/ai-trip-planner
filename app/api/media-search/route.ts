import { NextRequest, NextResponse } from 'next/server'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY'
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || 'YOUR_PIXABAY_API_KEY'
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY'

export async function POST(request: NextRequest) {
  try {
    const { destination, type = 'images' } = await request.json()

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    let data = []

    if (type === 'images') {
      data = await fetchImages(destination)
    } else if (type === 'videos') {
      data = await fetchVideos(destination)
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Media search error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

async function fetchImages(destination: string) {
  const queries = [
    `${destination} landmark`,
    `${destination} city`,
    `${destination} tourism`,
    `${destination} architecture`,
    `${destination} culture`,
    `${destination} travel`
  ]

  const allImages = []

  // Try Unsplash first (higher quality images)
  try {
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=15&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (unsplashResponse.ok) {
      const unsplashData = await unsplashResponse.json()
      const unsplashImages = unsplashData.results?.map((photo: any) => ({
        id: `unsplash_${photo.id}`,
        url: photo.urls.regular,
        thumb: photo.urls.small,
        alt: photo.alt_description || `${destination} image`,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        source: 'Unsplash',
        title: photo.description || photo.alt_description
      })) || []
      
      allImages.push(...unsplashImages)
    }
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
  }

  // If we have enough images from Unsplash, return them
  if (allImages.length >= 8) {
    return allImages.slice(0, 12)
  }

  // Otherwise, try other sources
  for (const query of queries.slice(0, 3)) { // Limit queries to avoid rate limits
    try {
      // Try Pexels
      if (PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY') {
        const pexelsResponse = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=4&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY
            }
          }
        )

        if (pexelsResponse.ok) {
          const pexelsData = await pexelsResponse.json()
          const pexelsImages = pexelsData.photos?.map((photo: any) => ({
            id: `pexels_${photo.id}`,
            url: photo.src.large,
            thumb: photo.src.medium,
            alt: photo.alt || `${destination} image`,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: 'Pexels',
            title: photo.alt
          })) || []
          
          allImages.push(...pexelsImages)
        }
      }

      // Try Pixabay if still need more images
      if (allImages.length < 8 && PIXABAY_API_KEY !== 'YOUR_PIXABAY_API_KEY') {
        const pixabayResponse = await fetch(
          `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&category=places&per_page=4&safesearch=true`
        )

        if (pixabayResponse.ok) {
          const pixabayData = await pixabayResponse.json()
          const pixabayImages = pixabayData.hits?.map((hit: any) => ({
            id: `pixabay_${hit.id}`,
            url: hit.largeImageURL,
            thumb: hit.webformatURL,
            alt: hit.tags || `${destination} image`,
            photographer: hit.user,
            photographerUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
            source: 'Pixabay',
            title: hit.tags
          })) || []
          
          allImages.push(...pixabayImages)
        }
      }
    } catch (error) {
      console.error(`Error fetching images for ${query}:`, error)
    }
  }

  // If still no real images found, return high-quality fallbacks
  if (allImages.length === 0) {
    return getFallbackImages(destination)
  }

  return allImages.slice(0, 12) // Limit to 12 images
}

async function fetchVideos(destination: string) {
  const allVideos = []

  try {
    if (PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY') {
      const pexelsResponse = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(destination)}&per_page=8&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        }
      )

      if (pexelsResponse.ok) {
        const data = await pexelsResponse.json()
        const pexelsVideos = data.videos?.map((video: any) => ({
          id: `video_${video.id}`,
          url: video.video_files.find((file: any) => file.quality === 'hd')?.link || video.video_files[0]?.link || '#',
          thumb: video.image,
          alt: `${destination} video`,
          photographer: video.user?.name || 'Unknown',
          photographerUrl: video.user?.url || '#',
          source: 'Pexels',
          title: `${destination} Video Tour`,
          duration: video.duration || 30
        })) || []
        
        allVideos.push(...pexelsVideos)
      }
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
  }

  // If no real videos found, return fallbacks
  if (allVideos.length === 0) {
    return getFallbackVideos(destination)
  }

  return allVideos.slice(0, 8)
}

function getFallbackImages(destination: string) {
  const categories = ['landmark', 'city', 'culture', 'architecture', 'tourism', 'street', 'nature', 'food', 'market', 'sunset']
  return categories.map((category, index) => ({
    id: `fallback_${index}`,
    url: `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination)},${category}`,
    thumb: `https://source.unsplash.com/600x400/?${encodeURIComponent(destination)},${category}`,
    alt: `${destination} ${category}`,
    photographer: 'Unsplash Community',
    photographerUrl: 'https://unsplash.com',
    source: 'Unsplash',
    title: `${destination} ${category.charAt(0).toUpperCase() + category.slice(1)}`
  }))
}

function getFallbackVideos(destination: string) {
  const videoTypes = ['tour', 'drone', 'timelapse', 'street']
  return videoTypes.map((type, index) => ({
    id: `fallback_video_${index}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + type + ' 4k video')}`,
    thumb: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},${type}`,
    alt: `${destination} ${type} video`,
    photographer: 'YouTube Community',
    photographerUrl: '#',
    source: 'YouTube',
    title: `${destination} ${type.charAt(0).toUpperCase() + type.slice(1)} Video`,
    duration: 180
  }))
}
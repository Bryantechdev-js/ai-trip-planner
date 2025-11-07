import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destination, type = 'both', limit = 20 } = await req.json();

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const liveMedia = await fetchLiveMedia(destination, type, limit);

    return NextResponse.json({
      success: true,
      destination,
      media: liveMedia,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live media error:', error);
    return NextResponse.json({ error: 'Failed to fetch live media' }, { status: 500 });
  }
}

async function fetchLiveMedia(destination: string, type: string, limit: number) {
  const media = {
    images: [],
    videos: [],
    liveStreams: []
  };

  try {
    // Fetch from multiple sources
    const [unsplashImages, pixabayMedia, youtubeVideos] = await Promise.allSettled([
      fetchUnsplashImages(destination, Math.ceil(limit / 2)),
      fetchPixabayMedia(destination, Math.ceil(limit / 2)),
      fetchYouTubeVideos(destination, Math.ceil(limit / 4))
    ]);

    // Process Unsplash images
    if (unsplashImages.status === 'fulfilled' && unsplashImages.value) {
      media.images.push(...unsplashImages.value);
    }

    // Process Pixabay media
    if (pixabayMedia.status === 'fulfilled' && pixabayMedia.value) {
      media.images.push(...pixabayMedia.value.images);
      media.videos.push(...pixabayMedia.value.videos);
    }

    // Process YouTube videos
    if (youtubeVideos.status === 'fulfilled' && youtubeVideos.value) {
      media.videos.push(...youtubeVideos.value);
    }

    // Add live webcam streams if available
    const liveStreams = await fetchLiveWebcams(destination);
    media.liveStreams = liveStreams;

  } catch (error) {
    console.error('Error fetching media:', error);
  }

  return media;
}

async function fetchUnsplashImages(destination: string, limit: number) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!UNSPLASH_ACCESS_KEY) {
    return generateFallbackImages(destination, limit);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=${limit}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    
    return data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      description: photo.description || photo.alt_description || `${destination} view`,
      photographer: photo.user.name,
      source: 'unsplash',
      type: 'image',
      location: destination,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return generateFallbackImages(destination, limit);
  }
}

async function fetchPixabayMedia(destination: string, limit: number) {
  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
  
  if (!PIXABAY_API_KEY) {
    return { images: [], videos: [] };
  }

  try {
    const [imageResponse, videoResponse] = await Promise.allSettled([
      fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(destination)}&image_type=photo&per_page=${Math.ceil(limit/2)}&safesearch=true`),
      fetch(`https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(destination)}&per_page=${Math.ceil(limit/2)}&safesearch=true`)
    ]);

    const images = [];
    const videos = [];

    if (imageResponse.status === 'fulfilled' && imageResponse.value.ok) {
      const imageData = await imageResponse.value.json();
      images.push(...imageData.hits.map((hit: any) => ({
        id: hit.id,
        url: hit.webformatURL,
        thumbnail: hit.previewURL,
        description: hit.tags,
        source: 'pixabay',
        type: 'image',
        location: destination,
        timestamp: new Date().toISOString()
      })));
    }

    if (videoResponse.status === 'fulfilled' && videoResponse.value.ok) {
      const videoData = await videoResponse.value.json();
      videos.push(...videoData.hits.map((hit: any) => ({
        id: hit.id,
        url: hit.videos.medium.url,
        thumbnail: hit.picture_id,
        description: hit.tags,
        source: 'pixabay',
        type: 'video',
        location: destination,
        duration: hit.duration,
        timestamp: new Date().toISOString()
      })));
    }

    return { images, videos };

  } catch (error) {
    console.error('Pixabay fetch error:', error);
    return { images: [], videos: [] };
  }
}

async function fetchYouTubeVideos(destination: string, limit: number) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(destination + ' travel tour')}&type=video&maxResults=${limit}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API error');
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      title: item.snippet.title,
      description: item.snippet.description,
      channel: item.snippet.channelTitle,
      source: 'youtube',
      type: 'video',
      location: destination,
      publishedAt: item.snippet.publishedAt,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('YouTube fetch error:', error);
    return [];
  }
}

async function fetchLiveWebcams(destination: string) {
  // This would integrate with webcam APIs like Windy.com or EarthCam
  // For now, return mock data
  return [
    {
      id: 'webcam_1',
      name: `${destination} Live View`,
      url: `https://example.com/webcam/${destination.toLowerCase()}`,
      thumbnail: `https://via.placeholder.com/400x300?text=${destination}+Live`,
      description: `Live webcam feed from ${destination}`,
      source: 'webcam',
      type: 'livestream',
      location: destination,
      isLive: true,
      timestamp: new Date().toISOString()
    }
  ];
}

function generateFallbackImages(destination: string, limit: number) {
  return Array.from({ length: limit }, (_, i) => ({
    id: `fallback_${i}`,
    url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(destination)}+${i + 1}`,
    thumbnail: `https://via.placeholder.com/300x200?text=${encodeURIComponent(destination)}+${i + 1}`,
    description: `${destination} scenic view ${i + 1}`,
    source: 'fallback',
    type: 'image',
    location: destination,
    timestamp: new Date().toISOString()
  }));
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const destination = url.searchParams.get('destination');
    const type = url.searchParams.get('type') || 'both';
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!destination) {
      return NextResponse.json({ error: 'Destination parameter is required' }, { status: 400 });
    }

    const liveMedia = await fetchLiveMedia(destination, type, limit);

    return NextResponse.json({
      success: true,
      destination,
      media: liveMedia,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live media GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch live media' }, { status: 500 });
  }
}
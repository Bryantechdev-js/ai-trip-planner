import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { destination, type } = await req.json();
        
        if (!destination) {
            return NextResponse.json({ error: "Destination is required" }, { status: 400 });
        }

        let data = [];

        if (type === 'images') {
            // Use Unsplash free API with enhanced fallback
            data = await fetchUnsplashImages(destination);
        } else if (type === 'videos') {
            // Use YouTube API with enhanced fallback
            data = await fetchVideoContent(destination);
        } else {
            // Return both images and videos
            const [images, videos] = await Promise.all([
                fetchUnsplashImages(destination),
                fetchVideoContent(destination)
            ]);
            data = { images, videos };
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Media search error:', error);
        return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
}

async function fetchUnsplashImages(destination: string) {
    try {
        // Free Unsplash API - requires signup but has generous free tier
        const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo_key';
        
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        
        if (response.ok) {
            const result = await response.json();
            return result.results.map((img: any) => ({
                id: img.id,
                url: img.urls.regular,
                thumb: img.urls.thumb,
                alt: img.alt_description || destination,
                photographer: img.user.name,
                photographerUrl: img.user.links.html
            }));
        }
    } catch (error) {
        console.error('Unsplash API error:', error);
    }
    
    // Enhanced fallback with multiple image sources and categories
    const imageCategories = [
        'travel,landmark', 'city,architecture', 'landscape,nature', 'culture,people',
        'food,cuisine', 'street,urban', 'museum,art', 'sunset,scenic',
        'market,shopping', 'festival,celebration', 'beach,coast', 'mountain,view'
    ];
    
    return imageCategories.map((category, index) => ({
        id: index + 1,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},${category}`,
        thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)},${category}`,
        alt: `${destination} ${category.split(',')[0]}`,
        photographer: 'Unsplash Community',
        photographerUrl: 'https://unsplash.com',
        title: `${destination} ${category.split(',')[0].charAt(0).toUpperCase() + category.split(',')[0].slice(1)}`
    }));
}

async function fetchVideoContent(destination: string) {
    try {
        // Try to get YouTube videos using YouTube Data API if available
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        
        if (YOUTUBE_API_KEY) {
            const searchQueries = [
                `${destination} travel guide 4k`,
                `${destination} walking tour`,
                `${destination} attractions documentary`,
                `${destination} food culture`,
                `${destination} virtual tour 360`
            ];
            
            const videoPromises = searchQueries.map(async (query, index) => {
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const video = data.items[0];
                        
                        if (video) {
                            return {
                                id: video.id.videoId,
                                url: `https://www.youtube.com/embed/${video.id.videoId}`,
                                thumb: video.snippet.thumbnails.medium.url,
                                title: video.snippet.title,
                                source: 'YouTube',
                                alt: video.snippet.description
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching video for query "${query}":`, error);
                }
                
                return null;
            });
            
            const videos = await Promise.all(videoPromises);
            const validVideos = videos.filter(video => video !== null);
            
            if (validVideos.length > 0) {
                return validVideos;
            }
        }
    } catch (error) {
        console.error('YouTube API error:', error);
    }
    
    // Enhanced fallback with better video suggestions
    const videoTypes = [
        { type: 'travel guide', description: 'Complete travel guide and tips' },
        { type: 'walking tour', description: 'Virtual walking tour experience' },
        { type: 'attractions', description: 'Top attractions and landmarks' },
        { type: 'food culture', description: 'Local cuisine and food culture' },
        { type: 'virtual tour 360', description: '360° virtual reality tour' },
        { type: 'documentary', description: 'Documentary and history' },
        { type: 'drone footage', description: 'Aerial drone footage' },
        { type: 'time lapse', description: 'Beautiful time-lapse videos' }
    ];
    
    return videoTypes.map((video, index) => ({
        id: index + 1,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + video.type)}`,
        thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)},${video.type.split(' ')[0]}`,
        title: `${destination} ${video.type.charAt(0).toUpperCase() + video.type.slice(1)}`,
        source: 'YouTube',
        alt: video.description
    }));
}
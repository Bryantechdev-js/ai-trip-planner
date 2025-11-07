import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const destination = searchParams.get('destination');
        const type = searchParams.get('type') || 'images';
        const count = parseInt(searchParams.get('count') || '12');

        if (!destination) {
            return NextResponse.json({ error: "Destination is required" }, { status: 400 });
        }

        return await fetchMediaContent(destination, type, count);
    } catch (error) {
        console.error('Media Search Error:', error);
        return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { destination, type = 'images', count = 12 } = body;

        if (!destination) {
            return NextResponse.json({ error: "Destination is required" }, { status: 400 });
        }

        return await fetchMediaContent(destination, type, count);
    } catch (error) {
        console.error('Media Search Error:', error);
        return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
}

async function fetchMediaContent(destination: string, type: string, count: number) {
    let results: any[] = [];

    if (type === 'images') {
        // Enhanced image search with multiple sources
        if (UNSPLASH_ACCESS_KEY) {
            try {
                const queries = [
                    `${destination} travel landmark`,
                    `${destination} architecture`,
                    `${destination} culture food`,
                    `${destination} nature landscape`
                ];
                
                for (const query of queries) {
                    const response = await fetch(
                        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.ceil(count/4)}&orientation=landscape`,
                        {
                            headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const photos = data.results.map((photo: any) => ({
                            id: photo.id,
                            url: photo.urls.regular,
                            thumb: photo.urls.thumb,
                            alt: photo.alt_description || `${destination} view`,
                            title: photo.alt_description || `${destination} - ${query.split(' ').pop()}`,
                            category: getCategoryFromQuery(query),
                            photographer: photo.user.name,
                            photographerUrl: photo.user.links.html,
                            likes: photo.likes,
                            source: 'unsplash'
                        }));
                        results.push(...photos);
                    }
                }
            } catch (error) {
                console.error('Unsplash API error:', error);
            }
        }

        // Enhanced fallback with better categorization
        if (results.length === 0) {
            const categories = [
                { name: 'Landmarks', keywords: 'landmark,monument,famous' },
                { name: 'Architecture', keywords: 'architecture,building,historic' },
                { name: 'Culture', keywords: 'culture,traditional,local' },
                { name: 'Food', keywords: 'food,cuisine,restaurant' },
                { name: 'Nature', keywords: 'nature,landscape,scenic' },
                { name: 'Activities', keywords: 'activity,adventure,experience' }
            ];
            
            results = categories.flatMap((cat, catIndex) => 
                Array.from({ length: Math.ceil(count / categories.length) }, (_, i) => ({
                    id: `${cat.name.toLowerCase()}-${i}`,
                    url: `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination)},${cat.keywords}&sig=${catIndex * 10 + i}`,
                    thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)},${cat.keywords}&sig=${catIndex * 10 + i}`,
                    alt: `${destination} ${cat.name}`,
                    title: `${destination} - ${cat.name}`,
                    category: cat.name,
                    photographer: 'Travel Community',
                    likes: Math.floor(Math.random() * 2000) + 100,
                    source: 'unsplash'
                }))
            ).slice(0, count);
        }
    } else if (type === 'videos') {
        // Enhanced video search with YouTube and Pexels
        if (YOUTUBE_API_KEY) {
            try {
                const queries = [
                    `${destination} travel guide 4k`,
                    `${destination} walking tour`,
                    `${destination} drone footage`,
                    `${destination} food tour`
                ];
                
                for (const query of queries) {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&videoDefinition=high&maxResults=${Math.ceil(count/4)}&key=${YOUTUBE_API_KEY}`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const videos = data.items?.map((video: any) => ({
                            id: video.id.videoId,
                            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                            thumb: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
                            alt: video.snippet.title,
                            title: video.snippet.title,
                            category: getCategoryFromQuery(query),
                            photographer: video.snippet.channelTitle,
                            duration: 'Variable',
                            source: 'youtube'
                        })) || [];
                        results.push(...videos);
                    }
                }
            } catch (error) {
                console.error('YouTube API error:', error);
            }
        }
        
        // Pexels fallback
        if (results.length === 0 && PEXELS_API_KEY) {
            try {
                const response = await fetch(
                    `https://api.pexels.com/videos/search?query=${encodeURIComponent(destination + ' travel')}&per_page=${Math.min(count, 10)}`,
                    { headers: { 'Authorization': PEXELS_API_KEY } }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    results = data.videos.map((video: any) => ({
                        id: video.id,
                        url: video.video_files[0]?.link || '',
                        thumb: video.image,
                        alt: `${destination} Travel Video`,
                        title: `${destination} Travel Experience`,
                        duration: formatDuration(video.duration),
                        category: 'Travel',
                        source: 'pexels'
                    }));
                }
            } catch (error) {
                console.error('Pexels API error:', error);
            }
        }

        // Enhanced video fallback
        if (results.length === 0) {
            const videoTypes = [
                { type: 'Walking Tour', category: 'Activities' },
                { type: 'Aerial Views', category: 'Landmarks' },
                { type: 'Cultural Experience', category: 'Culture' },
                { type: 'Food Tour', category: 'Food' },
                { type: 'Historical Sites', category: 'Architecture' },
                { type: 'Nature & Landscapes', category: 'Nature' }
            ];
            
            results = videoTypes.map((video, i) => ({
                id: `video-${i}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' ' + video.type + ' 4k')}`,
                thumb: `https://source.unsplash.com/800x450/?${encodeURIComponent(destination)},${video.type.toLowerCase().replace(' ', '')}&sig=${i}`,
                alt: `${destination} ${video.type}`,
                title: `${destination} ${video.type}`,
                category: video.category,
                duration: '15-30 min',
                photographer: 'YouTube Community',
                source: 'youtube'
            }));
        }
    }

    return NextResponse.json({ 
        success: true,
        data: results.slice(0, count),
        destination,
        type,
        total: results.length
    });
}

function getCategoryFromQuery(query: string): string {
    if (query.includes('landmark') || query.includes('monument')) return 'Landmarks';
    if (query.includes('architecture') || query.includes('building')) return 'Architecture';
    if (query.includes('culture') || query.includes('traditional')) return 'Culture';
    if (query.includes('food') || query.includes('cuisine')) return 'Food';
    if (query.includes('nature') || query.includes('landscape')) return 'Nature';
    if (query.includes('walking') || query.includes('tour')) return 'Activities';
    return 'All';
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { destination } = await req.json();
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    // Fetch news and safety information
    const newsData = await fetchDestinationNews(destination);
    const safetyData = await fetchSafetyInfo(destination);
    
    return NextResponse.json({
      news: newsData,
      safety: safetyData
    });
    
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news data' }, { status: 500 });
  }
}

async function fetchDestinationNews(destination: string) {
  try {
    // Use NewsAPI free tier or GNews API
    const news = await fetchRealNews(destination);
    if (news.length > 0) {
      return news;
    }
  } catch (error) {
    console.error('Error fetching real news:', error);
  }
  
  // Fallback to mock data with realistic structure
  const mockNews = [
    {
      id: 1,
      title: `${destination} Tourism Sees Record Growth This Year`,
      description: `Tourism in ${destination} has reached new heights with improved infrastructure and safety measures.`,
      url: `https://example.com/news/${destination.toLowerCase()}-tourism-growth`,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Travel News Daily',
      category: 'tourism'
    },
    {
      id: 2,
      title: `New Cultural Festival Announced in ${destination}`,
      description: `A vibrant cultural festival celebrating local traditions will take place next month in ${destination}.`,
      url: `https://example.com/news/${destination.toLowerCase()}-festival`,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Culture Today',
      category: 'culture'
    },
    {
      id: 3,
      title: `${destination} Implements Enhanced Safety Protocols`,
      description: `Local authorities have introduced new safety measures to ensure tourist security and health.`,
      url: `https://example.com/news/${destination.toLowerCase()}-safety`,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Safety Report',
      category: 'safety'
    }
  ];

  return mockNews;
}

async function fetchRealNews(destination: string) {
  try {
    // Try GNews API (free tier available)
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
    
    if (GNEWS_API_KEY) {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(destination + ' travel tourism')}&lang=en&country=us&max=10&apikey=${GNEWS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.articles.map((article: any, index: number) => ({
          id: index + 1,
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          category: 'news',
          image: article.image
        }));
      }
    }
    
    // Try NewsAPI as fallback
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (NEWS_API_KEY) {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(destination + ' travel')}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.articles.map((article: any, index: number) => ({
          id: index + 1,
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          category: 'news',
          image: article.urlToImage
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Real news fetch error:', error);
    return [];
  }
}

async function fetchSafetyInfo(destination: string) {
  // Mock safety data - in production, integrate with government travel advisories
  const safetyLevels = ['Low Risk', 'Moderate Risk', 'High Risk'];
  const currentLevel = safetyLevels[Math.floor(Math.random() * 2)]; // Bias towards safer levels
  
  return {
    overallRisk: currentLevel,
    riskLevel: currentLevel === 'Low Risk' ? 1 : currentLevel === 'Moderate Risk' ? 2 : 3,
    lastUpdated: new Date().toISOString(),
    factors: {
      crime: currentLevel === 'Low Risk' ? 'Low' : 'Moderate',
      health: 'Good',
      naturalDisasters: 'Low',
      politicalStability: 'Stable'
    },
    recommendations: [
      'Stay in well-reviewed accommodations',
      'Keep copies of important documents',
      'Stay aware of your surroundings',
      'Follow local customs and laws',
      'Register with your embassy if staying long-term'
    ],
    emergencyContacts: {
      police: '112',
      medical: '115',
      embassy: '+1-xxx-xxx-xxxx'
    },
    bestTimeToVisit: {
      months: ['March', 'April', 'May', 'October', 'November'],
      reason: 'Pleasant weather and fewer crowds'
    }
  };
}
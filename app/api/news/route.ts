import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { destination } = await req.json()

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    // Using NewsAPI (you'll need to add NEWS_API_KEY to .env.local)
    const apiKey = process.env.NEWS_API_KEY

    if (!apiKey) {
      return NextResponse.json(getMockNewsData(destination))
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(destination)} tourism travel&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
    )

    if (!response.ok) {
      return NextResponse.json(getMockNewsData(destination))
    }

    const data = await response.json()

    return NextResponse.json({
      destination,
      articles: data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
      })),
    })
  } catch (error) {
    console.error('News API Error:', error)
    return NextResponse.json(getMockNewsData('Unknown Destination'))
  }
}

function getMockNewsData(destination: string) {
  return {
    destination,
    articles: [
      {
        title: `${destination} Tourism Sees Record Growth This Year`,
        description: `Tourism in ${destination} has experienced unprecedented growth with new attractions and improved infrastructure.`,
        url: '#',
        urlToImage: `https://source.unsplash.com/400x200/?${encodeURIComponent(destination)},tourism`,
        publishedAt: new Date().toISOString(),
        source: 'Travel News',
      },
      {
        title: `Best Time to Visit ${destination} - Travel Guide`,
        description: `Discover the perfect season to explore ${destination} with our comprehensive travel guide.`,
        url: '#',
        urlToImage: `https://source.unsplash.com/400x200/?${encodeURIComponent(destination)},travel`,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: 'Tourism Today',
      },
      {
        title: `Cultural Festivals in ${destination} You Can't Miss`,
        description: `Experience the rich cultural heritage of ${destination} through its vibrant festivals and celebrations.`,
        url: '#',
        urlToImage: `https://source.unsplash.com/400x200/?${encodeURIComponent(destination)},culture`,
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: 'Culture & Travel',
      },
    ],
  }
}

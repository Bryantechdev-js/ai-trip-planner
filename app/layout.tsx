import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/ui/Header'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from './ConvexClientProvider'
import ClientLayout from './ClientLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Trip Planner - Smart Travel Planning Made Easy',
  description: 'Plan your perfect trip with AI-powered recommendations, real-time tracking, and smart automation. Create personalized itineraries, book accommodations, and explore destinations with confidence.',
  keywords: 'travel planning, AI trip planner, vacation planning, travel itinerary, smart travel, trip automation',
  authors: [{ name: 'AI Trip Planner Team' }],
  creator: 'AI Trip Planner',
  publisher: 'AI Trip Planner',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Trip Planner - Smart Travel Planning Made Easy',
    description: 'Plan your perfect trip with AI-powered recommendations and smart automation.',
    url: '/',
    siteName: 'AI Trip Planner',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner - Smart Travel Planning Made Easy',
    description: 'Plan your perfect trip with AI-powered recommendations and smart automation.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.variable} antialiased`}>
          <ErrorBoundary>
            <Header />
            <ConvexClientProvider>
              <ClientLayout>{children}</ClientLayout>
            </ConvexClientProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}

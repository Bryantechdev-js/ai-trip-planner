'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoaderProps {
  fallback?: React.ReactNode
  className?: string
}

const DefaultFallback = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className || ''}`}>
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
)

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: React.ComponentProps<T> & LazyLoaderProps) {
    const { fallback: customFallback, className, ...componentProps } = props

    return (
      <Suspense fallback={customFallback || <DefaultFallback className={className} />}>
        <LazyComponent {...componentProps} />
      </Suspense>
    )
  }
}

// Pre-built lazy components for common use cases
export const LazyTripMap = createLazyComponent(
  () => import('@/components/newTripCompunents/TripMapUI'),
  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-gray-600">Loading map...</p>
    </div>
  </div>
)

export const LazyVirtualTour = createLazyComponent(
  () => import('@/components/newTripCompunents/VirtualTourUI'),
  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-gray-600">Loading virtual tour...</p>
    </div>
  </div>
)

export const LazyExpenseTracker = createLazyComponent(
  () => import('@/components/ExpenseTracker'),
  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-gray-600">Loading expense tracker...</p>
    </div>
  </div>
)

export const LazyImageCarousel = createLazyComponent(
  () => import('@/components/ImageCarousel'),
  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-gray-600">Loading images...</p>
    </div>
  </div>
)

// Intersection Observer based lazy loading for components
export function LazyOnScroll({ 
  children, 
  fallback, 
  className,
  rootMargin = '100px' 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <DefaultFallback />)}
    </div>
  )
}
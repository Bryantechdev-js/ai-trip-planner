import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const enhanceTripWithMedia = mutation({
  args: {
    tripId: v.id('TripTable'),
    destination: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate gallery images for the trip
    const categories = ['landmarks', 'culture', 'food', 'nature', 'architecture', 'people']
    const galleryImages = categories.map((category, index) => ({
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(args.destination)},${category},travel`,
      thumbnail: `https://source.unsplash.com/400x300/?${encodeURIComponent(args.destination)},${category}`,
      title: `${args.destination} - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      category,
    }))

    // Generate video content
    const videoTypes = ['tour', 'culture', 'food', 'attractions']
    const videos = videoTypes.map((type, index) => ({
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(args.destination + ' ' + type + ' 4k')}`,
      thumbnail: `https://source.unsplash.com/640x360/?${encodeURIComponent(args.destination)},${type}`,
      title: `${args.destination} ${type.charAt(0).toUpperCase() + type.slice(1)} Experience`,
      duration: '15-30 min',
      type,
    }))

    await ctx.db.patch(args.tripId, {
      galleryImages,
      videos,
      coverImage: `https://source.unsplash.com/1200x800/?${encodeURIComponent(args.destination)},travel,landmark`,
    })
  },
})

export const createTrip = mutation({
  args: {
    userId: v.string(),
    destination: v.string(),
    sourceLocation: v.string(),
    groupSize: v.string(),
    budget: v.string(),
    duration: v.number(),
    interests: v.array(v.string()),
    tripPlan: v.object({
      attractions: v.array(v.string()),
      cuisine: v.array(v.string()),
      culture: v.object({
        languages: v.array(v.string()),
        currency: v.string(),
        timezone: v.string(),
        tips: v.array(v.string()),
      }),
      images: v.array(v.string()),
      virtualTourData: v.object({
        locations: v.array(
          v.object({
            name: v.string(),
            panoramaUrl: v.string(),
            description: v.string(),
          })
        ),
      }),
    }),
    isPublic: v.boolean(),
    coverImage: v.optional(v.string()),
    galleryImages: v.optional(
      v.array(
        v.object({
          url: v.string(),
          thumbnail: v.string(),
          title: v.string(),
          category: v.string(),
        })
      )
    ),
    videos: v.optional(
      v.array(
        v.object({
          url: v.string(),
          thumbnail: v.string(),
          title: v.string(),
          duration: v.string(),
          type: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Generate cover image if not provided
    const coverImage =
      args.coverImage ||
      `https://source.unsplash.com/1200x800/?${encodeURIComponent(args.destination)},travel,landmark`

    const tripId = await ctx.db.insert('TripTable', {
      ...args,
      coverImage,
      createdAt: Date.now(),
      status: 'planned',
    })
    return tripId
  },
})

export const getUserTrips = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('TripTable')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .collect()
  },
})

export const getUserTripStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query('TripTable')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .collect()

    const totalTrips = trips.length
    const publicTrips = trips.filter(trip => trip.isPublic).length
    const activeTrips = trips.filter(trip => trip.status === 'active').length
    const completedTrips = trips.filter(trip => trip.status === 'completed').length

    const destinations = [...new Set(trips.map(trip => trip.destination))]
    const totalDuration = trips.reduce((sum, trip) => sum + trip.duration, 0)

    return {
      totalTrips,
      publicTrips,
      activeTrips,
      completedTrips,
      uniqueDestinations: destinations.length,
      totalDuration,
      averageDuration: totalTrips > 0 ? Math.round(totalDuration / totalTrips) : 0,
    }
  },
})

export const getPublicTrips = query({
  args: { destination: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query('TripTable').filter(q => q.eq(q.field('isPublic'), true))

    if (args.destination) {
      query = query.filter(q => q.eq(q.field('destination'), args.destination.toLowerCase()))
    }

    return await query.order('desc').take(20)
  },
})

export const getTrendingDestinations = query({
  handler: async ctx => {
    const trips = await ctx.db
      .query('TripTable')
      .filter(q => q.eq(q.field('isPublic'), true))
      .collect()

    // Count destinations
    const destinationCounts = trips.reduce(
      (acc, trip) => {
        acc[trip.destination] = (acc[trip.destination] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Sort by popularity
    return Object.entries(destinationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([destination, count]) => ({ destination, count }))
  },
})

export const getTripById = query({
  args: { tripId: v.id('TripTable') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId)
  },
})

export const deleteTrip = mutation({
  args: { tripId: v.id('TripTable') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tripId)
  },
})

export const updateTrip = mutation({
  args: {
    tripId: v.id('TripTable'),
    updates: v.object({
      status: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      coverImage: v.optional(v.string()),
      galleryImages: v.optional(
        v.array(
          v.object({
            url: v.string(),
            thumbnail: v.string(),
            title: v.string(),
            category: v.string(),
          })
        )
      ),
      videos: v.optional(
        v.array(
          v.object({
            url: v.string(),
            thumbnail: v.string(),
            title: v.string(),
            duration: v.string(),
            type: v.string(),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tripId, args.updates)
  },
})

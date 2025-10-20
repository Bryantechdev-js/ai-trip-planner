import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
        tips: v.array(v.string())
      }),
      images: v.array(v.string()),
      virtualTourData: v.object({
        locations: v.array(v.object({
          name: v.string(),
          panoramaUrl: v.string(),
          description: v.string()
        }))
      })
    }),
    isPublic: v.boolean()
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("TripTable", {
      ...args,
      createdAt: Date.now()
    });
    return tripId;
  },
});

export const getUserTrips = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("TripTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getPublicTrips = query({
  args: { destination: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("TripTable").filter((q) => q.eq(q.field("isPublic"), true));
    
    if (args.destination) {
      query = query.filter((q) => 
        q.eq(q.field("destination"), args.destination.toLowerCase())
      );
    }
    
    return await query.order("desc").take(10);
  },
});

export const getTripById = query({
  args: { tripId: v.id("TripTable") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});
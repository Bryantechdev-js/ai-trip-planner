import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable:defineTable({
        name:v.string(),
        email:v.string(), 
        imageUrl:v.string(),
        subscription:v.optional(v.string())
    }),
    
    TripTable: defineTable({
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
        createdAt: v.number(),
        isPublic: v.boolean()
    }),
})
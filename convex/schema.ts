import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable:defineTable({
        name:v.string(),
        email:v.string(), 
        imageUrl:v.string(),
        subscription:v.optional(v.string()),
        subscriptionDueDate: v.optional(v.number()),
        subscriptionStartDate: v.optional(v.number()),
        paymentHistory: v.optional(v.array(v.object({
            planId: v.string(),
            amount: v.string(),
            currency: v.string(),
            paymentDate: v.number(),
            status: v.string()
        }))),
        emergencyContacts: v.optional(v.array(v.object({
            name: v.string(),
            phone: v.string(),
            email: v.optional(v.string()),
            relationship: v.string()
        }))),
        trackingPreferences: v.optional(v.object({
            allowGPS: v.boolean(),
            allowWiFi: v.boolean(),
            allowSIM: v.boolean(),
            allowBluetooth: v.boolean(),
            emergencyMode: v.boolean(),
            shareWithContacts: v.boolean()
        })),
        aiProfile: v.optional(v.object({
            travelPreferences: v.object({
                budgetRange: v.string(),
                preferredDestinations: v.array(v.string()),
                travelStyle: v.string(),
                groupSizePreference: v.string()
            }),
            learningData: v.optional(v.object({
                completedTrips: v.number(),
                favoriteActivities: v.array(v.string()),
                avgTripDuration: v.number(),
                preferredBudgetRange: v.string()
            }))
        }))
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
            }),
            hotels: v.optional(v.array(v.object({
                name: v.string(),
                rating: v.number(),
                price: v.string(),
                image: v.string(),
                location: v.string(),
                amenities: v.array(v.string())
            }))),
            itinerary: v.optional(v.array(v.object({
                day: v.number(),
                activities: v.array(v.object({
                    time: v.string(),
                    activity: v.string(),
                    location: v.string(),
                    duration: v.string(),
                    cost: v.optional(v.string())
                }))
            })))
        }),
        createdAt: v.number(),
        isPublic: v.boolean(),
        status: v.optional(v.string()), // planned, active, completed, cancelled
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        qrCode: v.optional(v.string()),
        shareCode: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        galleryImages: v.optional(v.array(v.object({
            url: v.string(),
            thumbnail: v.string(),
            title: v.string(),
            category: v.string()
        }))),
        videos: v.optional(v.array(v.object({
            url: v.string(),
            thumbnail: v.string(),
            title: v.string(),
            duration: v.string(),
            type: v.string()
        })))
    }),
    
    BookingTable: defineTable({
        userId: v.string(),
        tripId: v.string(),
        type: v.string(), // hotel, flight, activity, transport
        title: v.string(),
        description: v.string(),
        price: v.number(),
        currency: v.string(),
        bookingDate: v.number(),
        serviceDate: v.number(),
        status: v.string(), // pending, confirmed, cancelled
        provider: v.string(),
        confirmationCode: v.optional(v.string()),
        details: v.object({
            location: v.optional(v.string()),
            duration: v.optional(v.string()),
            participants: v.optional(v.number()),
            specialRequests: v.optional(v.string())
        })
    }),
    
    TrackingTable: defineTable({
        userId: v.string(),
        tripId: v.optional(v.string()),
        latitude: v.number(),
        longitude: v.number(),
        accuracy: v.optional(v.number()),
        timestamp: v.number(),
        source: v.string(), // gps, wifi, sim, ip, bluetooth
        batteryLevel: v.optional(v.number()),
        isEmergency: v.optional(v.boolean()),
        address: v.optional(v.string()),
        speed: v.optional(v.number()),
        heading: v.optional(v.number())
    }),
    
    TrendTable: defineTable({
        destination: v.string(),
        country: v.string(),
        popularity: v.number(),
        averageCost: v.number(),
        bestTimeToVisit: v.string(),
        trendingReason: v.string(),
        images: v.array(v.string()),
        lastUpdated: v.number(),
        tags: v.array(v.string()),
        rating: v.number(),
        realTimeData: v.optional(v.object({
            currentWeather: v.optional(v.object({
                temperature: v.number(),
                condition: v.string(),
                humidity: v.number()
            })),
            crowdLevel: v.optional(v.string()),
            safetyRating: v.optional(v.number())
        }))
    }),
    
    NotificationTable: defineTable({
        userId: v.string(),
        type: v.string(), // booking, tracking, trend, emergency
        title: v.string(),
        message: v.string(),
        isRead: v.boolean(),
        createdAt: v.number(),
        data: v.optional(v.object({
            tripId: v.optional(v.string()),
            bookingId: v.optional(v.string()),
            trackingId: v.optional(v.string()),
            actionUrl: v.optional(v.string())
        }))
    }),
    
    TripProgressTable: defineTable({
        userId: v.string(),
        tripId: v.string(),
        currentLocation: v.object({
            latitude: v.number(),
            longitude: v.number(),
            address: v.string()
        }),
        destination: v.object({
            latitude: v.number(),
            longitude: v.number(),
            address: v.string()
        }),
        progress: v.number(), // percentage 0-100
        estimatedArrival: v.number(),
        distanceRemaining: v.number(),
        route: v.array(v.object({
            latitude: v.number(),
            longitude: v.number(),
            timestamp: v.number()
        })),
        videoRecordings: v.optional(v.array(v.object({
            url: v.string(),
            timestamp: v.number(),
            duration: v.number(),
            location: v.object({
                latitude: v.number(),
                longitude: v.number()
            })
        }))),
        lastUpdated: v.number(),
        isActive: v.boolean()
    })
})
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await convex.query(api.CreateNewUser.GetUserByEmail, { email: userId });
        
        if (!user?.aiProfile) {
            // Create default AI profile
            const defaultProfile = {
                travelPreferences: {
                    budgetRange: "moderate",
                    preferredDestinations: [],
                    travelStyle: "balanced",
                    groupSizePreference: "small"
                },
                learningData: {
                    completedTrips: 0,
                    favoriteActivities: [],
                    avgTripDuration: 7,
                    preferredBudgetRange: "moderate"
                }
            };

            return NextResponse.json({
                success: true,
                profile: defaultProfile,
                isNew: true
            });
        }

        return NextResponse.json({
            success: true,
            profile: user.aiProfile,
            isNew: false
        });

    } catch (error) {
        console.error('AI Profile GET Error:', error);
        return NextResponse.json({ error: "Failed to fetch AI profile" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, preferences, learningData, tripData } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await convex.query(api.CreateNewUser.GetUserByEmail, { email: userId });
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update AI profile with new learning data
        const updatedProfile = {
            travelPreferences: {
                ...user.aiProfile?.travelPreferences,
                ...preferences
            },
            learningData: {
                ...user.aiProfile?.learningData,
                ...learningData
            }
        };

        // If trip data is provided, extract learning insights
        if (tripData) {
            const insights = extractLearningInsights(tripData, updatedProfile);
            updatedProfile.learningData = { ...updatedProfile.learningData, ...insights };
        }

        // Update user profile in database
        await convex.mutation(api.CreateNewUser.UpdateUserProfile, {
            userId: user._id,
            aiProfile: updatedProfile
        });

        return NextResponse.json({
            success: true,
            profile: updatedProfile,
            message: "AI profile updated successfully"
        });

    } catch (error) {
        console.error('AI Profile POST Error:', error);
        return NextResponse.json({ error: "Failed to update AI profile" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, action, data } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: "User ID and action are required" }, { status: 400 });
        }

        const user = await convex.query(api.CreateNewUser.GetUserByEmail, { email: userId });
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let updatedProfile = user.aiProfile || {
            travelPreferences: {
                budgetRange: "moderate",
                preferredDestinations: [],
                travelStyle: "balanced",
                groupSizePreference: "small"
            },
            learningData: {
                completedTrips: 0,
                favoriteActivities: [],
                avgTripDuration: 7,
                preferredBudgetRange: "moderate"
            }
        };

        switch (action) {
            case 'add_destination':
                if (data.destination && !updatedProfile.travelPreferences.preferredDestinations.includes(data.destination)) {
                    updatedProfile.travelPreferences.preferredDestinations.push(data.destination);
                }
                break;

            case 'add_activity':
                if (data.activity && !updatedProfile.learningData.favoriteActivities.includes(data.activity)) {
                    updatedProfile.learningData.favoriteActivities.push(data.activity);
                }
                break;

            case 'complete_trip':
                updatedProfile.learningData.completedTrips += 1;
                if (data.duration) {
                    const currentAvg = updatedProfile.learningData.avgTripDuration;
                    const tripCount = updatedProfile.learningData.completedTrips;
                    updatedProfile.learningData.avgTripDuration = 
                        Math.round((currentAvg * (tripCount - 1) + data.duration) / tripCount);
                }
                break;

            case 'update_budget_preference':
                if (data.budgetRange) {
                    updatedProfile.travelPreferences.budgetRange = data.budgetRange;
                    updatedProfile.learningData.preferredBudgetRange = data.budgetRange;
                }
                break;

            case 'update_travel_style':
                if (data.travelStyle) {
                    updatedProfile.travelPreferences.travelStyle = data.travelStyle;
                }
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Update user profile in database
        await convex.mutation(api.CreateNewUser.UpdateUserProfile, {
            userId: user._id,
            aiProfile: updatedProfile
        });

        return NextResponse.json({
            success: true,
            profile: updatedProfile,
            message: `AI profile updated: ${action}`
        });

    } catch (error) {
        console.error('AI Profile PUT Error:', error);
        return NextResponse.json({ error: "Failed to update AI profile" }, { status: 500 });
    }
}

function extractLearningInsights(tripData: any, currentProfile: any) {
    const insights: any = {};

    // Extract budget preferences
    if (tripData.budget) {
        insights.preferredBudgetRange = tripData.budget;
    }

    // Extract activity preferences
    if (tripData.interests && Array.isArray(tripData.interests)) {
        const currentActivities = currentProfile.learningData?.favoriteActivities || [];
        const newActivities = tripData.interests.filter((activity: string) => 
            !currentActivities.includes(activity)
        );
        if (newActivities.length > 0) {
            insights.favoriteActivities = [...currentActivities, ...newActivities].slice(0, 10);
        }
    }

    // Extract duration preferences
    if (tripData.duration) {
        const currentAvg = currentProfile.learningData?.avgTripDuration || 7;
        insights.avgTripDuration = Math.round((currentAvg + tripData.duration) / 2);
    }

    return insights;
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await convex.query(api.CreateNewUser.GetUserByEmail, { email: userId });
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Reset AI profile to default
        const defaultProfile = {
            travelPreferences: {
                budgetRange: "moderate",
                preferredDestinations: [],
                travelStyle: "balanced",
                groupSizePreference: "small"
            },
            learningData: {
                completedTrips: 0,
                favoriteActivities: [],
                avgTripDuration: 7,
                preferredBudgetRange: "moderate"
            }
        };

        await convex.mutation(api.CreateNewUser.UpdateUserProfile, {
            userId: user._id,
            aiProfile: defaultProfile
        });

        return NextResponse.json({
            success: true,
            message: "AI profile reset to default"
        });

    } catch (error) {
        console.error('AI Profile DELETE Error:', error);
        return NextResponse.json({ error: "Failed to reset AI profile" }, { status: 500 });
    }
}
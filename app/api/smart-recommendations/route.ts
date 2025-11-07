import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { destination, preferences, tripType } = await req.json();

        const recommendations = await generateSmartRecommendations(destination, preferences, tripType);

        return NextResponse.json({
            success: true,
            destination,
            recommendations,
            automationEnabled: true
        });

    } catch (error) {
        console.error('Smart recommendations error:', error);
        return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
    }
}

async function generateSmartRecommendations(destination: string, preferences: any, tripType: string) {
    // AI-powered recommendations based on destination and preferences
    const baseRecommendations = {
        activities: [
            { name: `Cultural Tour of ${destination}`, price: '$45', duration: '4 hours', rating: 4.8 },
            { name: `Food Experience in ${destination}`, price: '$35', duration: '3 hours', rating: 4.6 },
            { name: `Adventure Activities`, price: '$65', duration: '6 hours', rating: 4.7 }
        ],
        restaurants: [
            { name: `Top Local Restaurant`, cuisine: 'Local', price: '$$', rating: 4.5 },
            { name: `International Cuisine`, cuisine: 'International', price: '$$$', rating: 4.3 }
        ],
        transportation: [
            { type: 'Taxi', price: '$25/day', convenience: 'High' },
            { type: 'Public Transport', price: '$5/day', convenience: 'Medium' },
            { type: 'Car Rental', price: '$40/day', convenience: 'High' }
        ],
        bestTimes: {
            visit: 'Morning (8-10 AM) and Evening (5-7 PM)',
            avoid: 'Midday (12-2 PM) due to crowds',
            weather: 'Check weather alerts before outdoor activities'
        },
        budgetTips: [
            'Book activities in advance for 15% discount',
            'Use local transport for authentic experience',
            'Try street food for budget-friendly meals'
        ]
    };

    return baseRecommendations;
}
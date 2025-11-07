import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tripId, destination, emergencyType } = await req.json();

        if (emergencyType === 'activate') {
            // Activate emergency monitoring
            const emergencyProfile = {
                userId,
                tripId,
                destination,
                emergencyContacts: [],
                locationTracking: true,
                autoAlert: true,
                medicalInfo: {},
                activatedAt: new Date().toISOString()
            };

            return NextResponse.json({
                success: true,
                emergencyProfile,
                message: "Emergency monitoring activated",
                features: {
                    locationTracking: true,
                    emergencyContacts: true,
                    autoAlert: true,
                    medicalAssistance: true
                }
            });
        }

        // Handle emergency alert
        if (emergencyType === 'alert') {
            await sendEmergencyAlert(userId, destination);
            return NextResponse.json({
                success: true,
                message: "Emergency alert sent to contacts and local services"
            });
        }

        return NextResponse.json({ error: "Invalid emergency type" }, { status: 400 });

    } catch (error) {
        console.error('Emergency system error:', error);
        return NextResponse.json({ error: "Emergency system failed" }, { status: 500 });
    }
}

async function sendEmergencyAlert(userId: string, location: string) {
    // Simulate emergency alert system
    console.log(`Emergency alert sent for user ${userId} at ${location}`);
    
    // In production, integrate with:
    // - Local emergency services API
    // - SMS/Email notification services
    // - Embassy/consulate contact systems
    
    return {
        alertSent: true,
        services: ['local_emergency', 'embassy', 'emergency_contacts'],
        timestamp: new Date().toISOString()
    };
}
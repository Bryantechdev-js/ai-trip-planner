import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tripId, automationType, preferences } = await req.json();

        // Trigger all automation features
        const automationResults = await Promise.allSettled([
            // Auto-booking system
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, userId, destination: preferences.destination })
            }),
            // Expense tracking setup
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, userId, autoTrack: true })
            }),
            // Emergency system activation
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/emergency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, userId, destination: preferences.destination })
            }),
            // Notification setup
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, userId, preferences })
            })
        ]);

        return NextResponse.json({
            success: true,
            automationEnabled: true,
            features: {
                booking: automationResults[0].status === 'fulfilled',
                expenses: automationResults[1].status === 'fulfilled',
                emergency: automationResults[2].status === 'fulfilled',
                notifications: automationResults[3].status === 'fulfilled'
            }
        });

    } catch (error) {
        console.error('Automation error:', error);
        return NextResponse.json({ error: "Automation setup failed" }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";

// Emergency contacts storage (use database in production)
const emergencyContacts = new Map<string, Array<{
    name: string;
    phone: string;
    email: string;
    relationship: string;
}>>();

export async function POST(req: NextRequest) {
    try {
        const { destination, userId, action, contacts, emergency } = await req.json();
        
        if (action === 'save-contacts') {
            emergencyContacts.set(userId, contacts);
            return NextResponse.json({ message: "Emergency contacts saved" });
        }
        
        if (action === 'emergency-alert') {
            const userContacts = emergencyContacts.get(userId) || [];
            
            // Send emergency notifications
            const notifications = userContacts.map(async (contact) => {
                // Simulate email/SMS sending
                console.log(`🚨 EMERGENCY ALERT sent to ${contact.name} (${contact.email})`);
                console.log(`Location: ${emergency.location}`);
                console.log(`Message: ${emergency.message}`);
                
                return {
                    contact: contact.name,
                    status: 'sent',
                    method: ['email', 'sms']
                };
            });
            
            const results = await Promise.all(notifications);
            return NextResponse.json({ 
                message: "Emergency alerts sent",
                notifications: results
            });
        }
        
        // Safety assessment for destination
        const safetyData = await assessDestinationSafety(destination);
        
        return NextResponse.json({
            destination,
            safetyScore: safetyData.score,
            alerts: safetyData.alerts,
            recommendations: safetyData.recommendations,
            emergencyNumbers: safetyData.emergencyNumbers
        });
        
    } catch (error) {
        console.error('Safety API error:', error);
        return NextResponse.json({ 
            error: "Safety check failed" 
        }, { status: 500 });
    }
}

async function assessDestinationSafety(destination: string) {
    // Simulate safety assessment (integrate with real APIs in production)
    const safetyScores = {
        'paris': { score: 85, risk: 'low' },
        'tokyo': { score: 95, risk: 'very low' },
        'london': { score: 88, risk: 'low' },
        'new york': { score: 82, risk: 'moderate' },
        'bangkok': { score: 75, risk: 'moderate' }
    };
    
    const destKey = destination.toLowerCase();
    const safety = safetyScores[destKey] || { score: 70, risk: 'moderate' };
    
    return {
        score: safety.score,
        alerts: [
            safety.score < 70 ? "⚠️ High crime rate in some areas" : null,
            "🌡️ Check weather conditions before travel",
            "💉 Verify vaccination requirements"
        ].filter(Boolean),
        recommendations: [
            "📱 Share live location with emergency contacts",
            "🏥 Locate nearest hospitals and embassies",
            "💳 Keep emergency cash and backup cards",
            "📞 Save local emergency numbers"
        ],
        emergencyNumbers: {
            police: "112",
            medical: "112", 
            fire: "112",
            embassy: "+1-xxx-xxx-xxxx"
        }
    };
}
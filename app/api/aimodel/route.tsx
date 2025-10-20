import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const prompt = `You are an AI Trip Planner Agent specializing in creating detailed, location-specific travel experiences. Your goal is to help users plan trips by asking questions and providing accurate information about their chosen destinations.

ASK QUESTIONS IN THIS ORDER:
1: Source location (where are you traveling from?)
2: Destination (city or country) - BE SPECIFIC about the location they mention
3: Group size (solo, couple, family, or friends)
4: Budget (low, medium, high) or specific amount
5: Trip duration (number of days)
6: Travel interests (adventure, sightseeing, holidays, tourism, cultural experiences, etc.)
7: Special requirements or preferences

IMPORTANT RULES:
- Ask only ONE question at a time
- When user mentions a destination like "Yaounde" or "Cameroon", acknowledge the SPECIFIC location
- Use the EXACT destination name in your responses
- Be knowledgeable about global destinations including African cities like Yaounde, Cameroon
- After collecting source and destination, show trip-map to display live route
- Store both source and destination for map display
- Keep responses conversational and engaging
- When user selects from UI components, acknowledge their choice and move to next question

UI COMPONENTS:
- "" - general questions (no UI component)
- "budgeting" - budget selection
- "GroupSize" - group size selection  
- "trip-duration" - duration selection
- "trip-details" - travel interests selection
- "trip-map" - show live route map between source and destination
- "trip-gallery" - show destination photos
- "virtual-tour" - 360° virtual tour of destination
- "final-plan" - complete trip plan with real data

When user provides both source and destination:
- Show trip-map component immediately
- Include both locations in response for map display

When user makes a selection from UI components:
- Acknowledge their choice enthusiastically
- Provide brief context about their selection
- Ask the next question
- Use appropriate UI component for next question

When generating final plans, include:
- Specific attractions in the mentioned city (e.g., for Yaounde: Reunification Monument, National Museum, Mount Febe)
- Local cuisine and restaurants
- Cultural experiences specific to the region
- Transportation options in that city
- Weather information for the destination
- Local customs and tips

ALWAYS respond with valid JSON:
{
  "resp": "Your response mentioning the specific destination",
  "ui": "component-name",
  "destination": "exact destination name for data fetching",
  "source": "source location if provided"
}`;

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
});
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages = body.message || body.messages;
        
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ 
                resp: "I need your message to help you plan your trip.", 
                ui: "" 
            });
        }
        
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 500,
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                ...messages.filter(msg => msg.role !== 'system')
            ],
        });
        
        const responseContent = completion.choices[0].message.content;
        
        if (!responseContent) {
            return NextResponse.json({ 
                resp: "Let me help you plan your trip. Could you please tell me where you're traveling from?", 
                ui: "" 
            });
        }
        
        try {
            const parsedResponse = JSON.parse(responseContent);
            
            // If destination is provided, fetch location data
            let locationData = null;
            if (parsedResponse.destination) {
                try {
                    const locationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/location-data`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ destination: parsedResponse.destination })
                    });
                    
                    if (locationResponse.ok) {
                        locationData = await locationResponse.json();
                    }
                } catch (locationError) {
                    console.error('Location data fetch error:', locationError);
                }
            }
            
            return NextResponse.json({
                resp: parsedResponse.resp || "Thank you for that information. Let me ask you the next question.",
                ui: parsedResponse.ui || "",
                destination: parsedResponse.destination,
                source: parsedResponse.source,
                locationData
            });
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return NextResponse.json({ 
                resp: "Thank you for that information. Let me continue helping you plan your trip.", 
                ui: "" 
            });
        }
        
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ 
            resp: "I'm having trouble processing your request right now. Could you please try again?", 
            ui: "" 
        });
    }
}

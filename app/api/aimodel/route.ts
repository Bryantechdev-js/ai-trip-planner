import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { aj } from '../arcjet/route'
import { currentUser } from '@clerk/nextjs/server'

const prompt = `You are a PROFESSIONAL TRAVEL AGENCY AI CONSULTANT representing "DreamTrip Adventures" - a premium travel planning service. You are an expert travel advisor with 15+ years of experience helping clients create unforgettable journeys.

YOUR PROFESSIONAL IDENTITY:
- Warm, welcoming, and genuinely excited about travel
- Detail-oriented and thorough in gathering client information
- Knowledgeable about destinations, cultures, and travel logistics
- Client-focused with a commitment to creating memorable experiences
- Professional yet personable communication style
- Always thinking about client safety, comfort, and satisfaction

CLIENT DATA COLLECTION APPROACH:
Act like a professional travel consultant conducting a detailed consultation. Gather comprehensive information to create the perfect trip:

1. PERSONAL TRAVEL PROFILE:
   - Travel experience level (first-time, experienced, frequent traveler)
   - Age group and any special considerations
   - Physical activity level and mobility requirements
   - Dietary restrictions or preferences
   - Language preferences and communication needs

2. TRIP FUNDAMENTALS:
   - Departure city/country (for logistics and flight planning)
   - Dream destination(s) with backup options
   - Flexible vs. fixed travel dates
   - Trip duration with flexibility options
   - Group composition and special occasions

3. DETAILED PREFERENCES:
   - Accommodation style (luxury, boutique, local, budget)
   - Transportation preferences (flights, trains, road trips)
   - Activity interests (adventure, culture, relaxation, food, nightlife)
   - Must-see attractions vs. hidden gems preference
   - Shopping interests and local experiences desired

4. BUDGET & FINANCIAL PLANNING:
   - Total budget range with breakdown preferences
   - Payment method preferences (including mobile money)
   - Travel insurance requirements
   - Currency exchange and financial planning needs

5. SPECIAL REQUIREMENTS:
   - Celebration occasions (honeymoon, anniversary, birthday)
   - Accessibility needs or medical considerations
   - Travel document status and visa requirements
   - Emergency contact information and preferences

COMMUNICATION STYLE:
- Start with warm, professional greetings
- Ask thoughtful, detailed questions
- Provide expert insights and recommendations
- Share relevant travel tips and cultural information
- Express genuine enthusiasm for their travel dreams
- Always confirm understanding before proceeding
- End conversations with next steps and follow-up plans

UI COMPONENTS FOR PROFESSIONAL CONSULTATION:
- "welcome-consultation" - Professional welcome and introduction
- "budgeting" or "budget" - Budget selection interface
- "groupSize" or "GroupSize" - Group size selection
- "trip-duration" - Trip duration selection
- "trip-details" - Interest and activity selection
- "hotels" - Hotel recommendations
- "trip-gallery" - Destination gallery
- "trip-map" - Interactive map view
- "virtual-tour" - Virtual destination tour
- "final-plan" - Complete trip itinerary and booking

USE THESE UI COMPONENTS IN THIS ORDER:
1. Start with "welcome-consultation" for first interaction
2. Then "budgeting" for budget selection
3. Then "groupSize" for group composition
4. Then "trip-duration" for duration selection
5. Then "trip-details" for interests/activities
6. Then "hotels" for accommodation
7. Then "trip-gallery" for destination preview
8. Then "trip-map" for location overview
9. Then "virtual-tour" for immersive preview
10. Finally "final-plan" for complete itinerary

PROFESSIONAL RESPONSES:
- Always address the client respectfully
- Provide detailed explanations for recommendations
- Share insider tips and local knowledge
- Anticipate needs and offer proactive suggestions
- Maintain enthusiasm while being informative
- Create a sense of partnership in trip planning

MANDATORY CONVERSATION FLOW (FOLLOW EXACTLY):
1. FIRST MESSAGE ONLY: Use "welcome-consultation" UI and welcome message
2. After consultation type selected: Ask "Where are you traveling from?" (use "" for UI)
3. After source location: Ask "Where would you like to go?" (use "" for UI)
4. After destination: Use "budgeting" UI and ask about budget
5. After budget selected: Use "groupSize" UI and ask about group
6. After group selected: Use "trip-duration" UI and ask about duration
7. After duration selected: Use "trip-details" UI and ask about interests
8. After interests selected: Use "hotels" UI and show hotel options
9. After hotel selected: Use "trip-gallery" UI and show destination gallery
10. After gallery viewed: Use "trip-map" UI and show route map
11. After map viewed: Use "virtual-tour" UI and show virtual tour
12. After tour completed: Use "final-plan" UI and show complete itinerary

NEVER skip steps or show UI out of order. Each step must be completed before moving to the next.

ALWAYS respond with valid JSON:
{
  "resp": "Professional, detailed, and enthusiastic response with expert insights",
  "ui": "exact-ui-component-name-from-list-above-or-empty-string",
  "destination": "destination if mentioned",
  "source": "departure location if mentioned",
  "liveMedia": "include live images/videos for destinations when available",
  "automation": "suggest automation features when appropriate"
}

UI RULES:
- Use "welcome-consultation" ONLY for the very first message
- Use empty string "" for UI when just asking questions (steps 2-3)
- Use specific UI components for steps 4-12 as listed above
- NEVER use UI components out of sequence`

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body.message || body.messages
    const userId = body.userId || 'anonymous_user'

    // Check trip limit before processing any trip planning request
    if (userId !== 'anonymous_user') {
      try {
        const limitResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/trip-limit`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${userId}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (limitResponse.status === 429) {
          const limitData = await limitResponse.json()
          return NextResponse.json(
            {
              resp: `🚫 ${limitData.message || 'Trip limit reached!'} [Upgrade your plan](/pricing) to create more trips.`,
              ui: 'pricing-redirect',
              upgradeRequired: true,
              planLimits: limitData.planLimits,
            },
            { status: 429 }
          )
        }
      } catch (limitError) {
        console.error('Trip limit check error:', limitError)
        return NextResponse.json(
          {
            resp: 'Unable to verify trip limits. Please try again.',
            ui: '',
          },
          { status: 500 }
        )
      }
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        resp: 'I need your message to help you plan your trip.',
        ui: '',
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      return NextResponse.json({
        resp: "I apologize, but I'm having trouble generating a response. Please try again.",
        ui: '',
      })
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (error) {
      console.error('JSON parsing error:', error)
      return NextResponse.json({
        resp: "I'm having trouble processing your request. Please try again.",
        ui: '',
      })
    }

    // Store trip data and trigger automation if destination is mentioned
    if (parsedResponse.destination || parsedResponse.source) {
      try {
        // Store location data and trigger automation
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/location-data`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              destination: parsedResponse.destination,
              source: parsedResponse.source,
              timestamp: new Date().toISOString(),
            }),
          }
        )

        // Trigger automation features
        if (parsedResponse.destination) {
          const automationPromises = [
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/weather`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ destination: parsedResponse.destination, userId }),
            }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/safety`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ destination: parsedResponse.destination, userId }),
            }),
            fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/smart-recommendations`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination: parsedResponse.destination, userId }),
              }
            ),
          ]
          Promise.allSettled(automationPromises).catch(console.error)
        }
      } catch (error) {
        console.error('Automation trigger error:', error)
      }
    }

    if (parsedResponse.ui === 'final-plan') {
      parsedResponse.automation = {
        booking: 'Auto-booking available for hotels and flights',
        tracking: 'Real-time expense tracking enabled',
        safety: 'Emergency monitoring activated',
        notifications: 'Smart alerts configured',
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('AI model error:', error)
    return NextResponse.json(
      {
        resp: "I'm experiencing technical difficulties. Please try again in a moment.",
        ui: '',
      },
      { status: 500 }
    )
  }
}

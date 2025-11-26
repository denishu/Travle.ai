import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/openrouter';
import { MapRecommendationRequest, MapRecommendationResponse, TravelPlan } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: MapRecommendationRequest = await request.json();
    const { coordinates, locationName, nearbyAttractions, nearbyCities } = body;

    // Validate request
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    // Build context about the location
    const hasAttractions = nearbyAttractions && nearbyAttractions.length > 0;
    const attractionsSource = hasAttractions && nearbyAttractions[0]?.kinds?.includes('wikipedia') 
      ? '(from Wikipedia - notable places)'
      : '(from OpenTripMap - tourist attractions)';
    
    const attractionsText = hasAttractions
      ? `${attractionsSource}\n` + nearbyAttractions
          .slice(0, 15)
          .map((a, idx) => `${idx + 1}. ${a.name} - ${(a.dist / 1000).toFixed(1)} km away${a.rate > 0 && a.rate !== 3 ? ` (rating: ${a.rate}/7)` : ''}`)
          .join('\n')
      : 'No major attractions found in the database for this area. Focus on general local experiences and culture.';

    const citiesText = nearbyCities && nearbyCities.length > 0
      ? nearbyCities.slice(0, 5).join(', ')
      : 'No major cities found nearby';

    // Handle edge cases
    const isRemote = (!nearbyAttractions || nearbyAttractions.length === 0) && 
                     (!nearbyCities || nearbyCities.length === 0);
    
    const isWater = locationName.toLowerCase().includes('ocean') || 
                    locationName.toLowerCase().includes('sea') ||
                    locationName.toLowerCase().includes('atlantic') ||
                    locationName.toLowerCase().includes('pacific');

    // Construct the prompt
    const systemPrompt = `You are a helpful travel advisor assistant. A user has clicked on a location on a map, and you need to provide personalized travel recommendations for that SPECIFIC area.

Your task is to analyze the location information and nearby attractions, then create 2-3 compelling travel plan options.

CRITICAL RULES:
1. ALL travel plans MUST be centered around the clicked location
2. ALL destinations MUST be in the same city/region as the clicked location or within 100km
3. Do NOT recommend destinations in other countries or distant cities
4. Focus on the local area, nearby attractions, and regional day trips only
5. If the location is a small town, recommend exploring that town and its immediate surroundings
6. ONLY use attractions from the "Nearby attractions" list provided - do NOT make up or add attractions from your general knowledge
7. Do NOT mention activities that aren't supported by the provided data (e.g., don't say "hiking in mountains" if no mountains are listed)
8. If the provided attractions list is empty or limited, focus on the general area and local experiences rather than inventing specific attractions

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any text before or after the JSON.

The JSON must follow this exact structure:
{
  "summary": "Brief overview of the area and why it's worth visiting",
  "plans": [
    {
      "id": "unique-id",
      "destination": "City/Area Name",
      "country": "Country Name",
      "duration": {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "nights": number
      },
      "budget": {
        "estimated": number,
        "currency": "USD",
        "breakdown": {
          "admission": number,
          "activities": number,
          "food": number,
          "transportation": number
        }
      },
      "highlights": ["Place/Attraction 1", "Place/Attraction 2", "Place/Attraction 3"],
      "activities": ["Activity/Experience 1", "Activity/Experience 2", "Activity/Experience 3"],
      "accommodation": {
        "type": "hotel/hostel/resort/etc",
        "description": "Brief description"
      },
      "transportation": {
        "arrival": "How to get there",
        "local": "How to get around locally"
      },
      "bestFor": ["type of traveler1", "type of traveler2"],
      "considerations": ["important note1", "important note2"]
    }
  ]
}

FIELD DEFINITIONS:
- "destination": The name of the attraction/location
- "highlights": What makes this attraction SPECIAL/UNIQUE (features, views, experiences)
  Example for Grouse Mountain: ["Panoramic city views", "Grizzly bear habitat", "Alpine scenery"]
  NOT: ["Grouse Mountain"] - don't repeat the destination name!
- "activities": Specific things to DO at this attraction
  Example for Grouse Mountain: ["Ride the Skyride gondola", "Hike mountain trails", "Watch bear shows"]

CRITICAL RULES:
- Generate 2-3 SEPARATE plans (this means 2-3 items in the "plans" array)
- EACH plan focuses on ONE SINGLE attraction
- "highlights" = WHY this place is special (features, not the place name)
- "activities" = WHAT you can do there (specific actions)
- Budget should be DAY-TRIP focused (admission + activities + food + local transport)
  - NO flights or accommodation costs
  - Focus on what it costs to visit this ONE attraction for a day
  - Be realistic about admission fees, activity costs, meals, and local transport
- Duration should reflect REALISTIC visit time in hours
  - "hours": Estimated time needed to visit this attraction (e.g., 2-8 hours)
  - Consider: travel time, activities, meals
  - Examples: Museum (2-3h), Theme park (6-8h), Mountain (4-6h), Park (2-4h)
  - nights should be 0 (day trip)
  - startDate and endDate should be the same

EXAMPLE:
Plan 1: Grouse Mountain
  → highlights: ["Panoramic views", "Bear habitat", "Alpine scenery"]
  → activities: ["Gondola ride", "Hiking", "Bear shows"]
Plan 2: Stanley Park
  → highlights: ["Waterfront seawall", "Totem poles", "Forest trails"]
  → activities: ["Bike seawall", "Visit totems", "Beach walks"]`;

    let userPrompt = '';

    if (isWater) {
      userPrompt = `The user clicked on a water location: ${locationName}
Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}

Nearby cities: ${citiesText}

IMPORTANT: Since this is a water location, recommend ONLY the nearest coastal cities and beach destinations.

Create 2-3 travel plans that:
1. Focus on the CLOSEST coastal cities to these coordinates
2. Include beach destinations and water-based activities in THIS REGION
3. Stay within 200km of the clicked location
4. Do NOT recommend distant countries or far-away destinations

All destinations must be near the clicked coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
    } else if (isRemote) {
      userPrompt = `The user clicked on a remote location: ${locationName}
Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}

IMPORTANT: This is a remote area. Recommend experiences focused on THIS SPECIFIC LOCATION.

Create 2-3 travel plans that:
1. Focus on ${locationName} and its immediate surroundings
2. Include adventure and nature-focused experiences in THIS AREA
3. Suggest nearby towns (within 100km) that could serve as base camps
4. Embrace the remote, off-the-beaten-path nature of THIS SPECIFIC LOCATION
5. Do NOT recommend distant cities or other countries

All destinations must be centered around: ${locationName}`;
    } else {
      userPrompt = `The user clicked on this location: ${locationName}
Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}

=== NEARBY ATTRACTIONS (USE ONLY THESE) ===
${attractionsText}
=== END OF ATTRACTIONS LIST ===

Nearby cities: ${citiesText}

IMPORTANT: Create 2-3 diverse travel plan options that are ALL focused on ${locationName} and its immediate surroundings.

YOU MUST USE ONLY THE ATTRACTIONS LISTED ABOVE. These are the actual attractions near this location based on real geographic data.

NOTE: The list may include some infrastructure (subway stations, roads). Focus on actual tourist attractions, landmarks, parks, museums, historic sites, and cultural venues. Ignore pure infrastructure.

Requirements:
1. ALL plans must have "${locationName}" or a nearby location (within 100km) as the destination
2. ONLY use attractions from the "Nearby attractions" list above - these are the ACTUAL attractions near this location
3. Do NOT add attractions from your general knowledge that aren't in the list
4. If an attraction is listed with a distance, respect that distance - don't suggest things that are far away
5. Include day trip options to nearby cities ONLY if they are in the "Nearby cities" list
6. Cater to different travel styles (budget, luxury, adventure, cultural, etc.)
7. Provide realistic budget estimates
8. Suggest appropriate trip durations (2-7 nights)
9. If the attractions list is limited, focus on local experiences, food, culture, and exploring the neighborhood

CRITICAL: Base your recommendations ONLY on the provided data. Do NOT invent attractions, mountains, beaches, or other features that aren't mentioned in the nearby attractions list.

DO NOT recommend destinations in other countries or distant cities. Keep everything focused on the clicked location: ${locationName}.`;
    }

    // Call OpenRouter API
    const response = await openRouterClient.chat(
      [
        { role: 'system', content: systemPrompt, timestamp: Date.now() },
        { role: 'user', content: userPrompt, timestamp: Date.now() }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    // Parse the response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const content = response.content.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        parsedResponse = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response.content);
      return NextResponse.json(
        { error: 'Failed to generate valid recommendations. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!parsedResponse.plans || !Array.isArray(parsedResponse.plans)) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Ensure each plan has an ID
    const travelPlans: TravelPlan[] = parsedResponse.plans.map((plan: any, index: number) => ({
      ...plan,
      id: plan.id || `map-plan-${Date.now()}-${index}`
    }));

    const result: MapRecommendationResponse = {
      travelPlans,
      summary: parsedResponse.summary || 'Here are some travel recommendations for this location.',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in map-recommendations API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

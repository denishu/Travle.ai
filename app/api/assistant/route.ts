import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '../../../lib/openrouter';
import { 
  AssistantRequest, 
  AssistantResponse, 
  Message, 
  RecommendationResponse,
  TravelPlan 
} from '../../../lib/types';

/**
 * API Route: /api/assistant
 * Handles conversation with the AI travel advisor
 * 
 * Requirements: 10.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.4
 */

/**
 * Analyze conversation to determine if sufficient information has been gathered
 * to generate travel recommendations
 * 
 * Requirements: 4.1
 */
function shouldGenerateRecommendations(messages: Message[]): {
  shouldGenerate: boolean;
  missingInfo: string[];
} {
  // Combine all conversation text for analysis
  const conversationText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  const missingInfo: string[] = [];

  // Check for destination information
  const hasDestination = /\b(want to|going to|visit|travel to|interested in|thinking about)\s+\w+/.test(conversationText) ||
    /\b(beach|mountain|city|europe|asia|africa|america|country|island)\b/.test(conversationText);
  
  if (!hasDestination) {
    missingInfo.push('destination');
  }

  // Check for budget information
  const hasBudget = /\$\d+|budget|spend|afford|cost|price|cheap|expensive|\d+\s*(dollars|usd|euros|pounds)/.test(conversationText);
  
  if (!hasBudget) {
    missingInfo.push('budget');
  }

  // Check for date/timeframe information
  const hasDates = /\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/.test(conversationText) ||
    /next (week|month|year|summer|winter|spring|fall)/.test(conversationText) ||
    /in \d+ (days|weeks|months)/.test(conversationText) ||
    /\b(soon|later|planning)\b/.test(conversationText);
  
  if (!hasDates) {
    missingInfo.push('dates');
  }

  // Need at least destination and one other piece of info to generate recommendations
  const shouldGenerate = hasDestination && (hasBudget || hasDates);

  return {
    shouldGenerate,
    missingInfo
  };
}

/**
 * Construct system prompt for information gathering phase
 * 
 * Requirements: 4.2, 4.3
 */
function getInformationGatheringPrompt(missingInfo: string[]): string {
  return `You are a helpful travel advisor assistant. Your role is to gather travel requirements from users through natural conversation.

CURRENT PHASE: Information Gathering

You are collecting the following information from the user:
- Destination preferences (specific places, regions, or types of destinations)
- Travel dates or timeframe
- Budget range
- Interests and preferred activities
- Any constraints (dietary, accessibility, etc.)

MISSING INFORMATION: ${missingInfo.join(', ')}

GUIDELINES:
- Be conversational, friendly, and enthusiastic about travel
- Ask one or two questions at a time - don't overwhelm the user
- Focus on gathering the missing information: ${missingInfo.join(', ')}
- Show that you're listening by acknowledging what they've already shared
- Keep responses concise (2-3 sentences)
- Once you have destination and at least one of (budget OR dates), you'll be ready to provide recommendations

Do NOT generate travel recommendations yet. Just continue the conversation to gather information.`;
}

/**
 * Construct system prompt for recommendation generation phase
 * 
 * Requirements: 4.4, 5.4
 */
function getRecommendationPrompt(): string {
  return `You are a helpful travel advisor assistant. You have gathered sufficient information from the user and are now ready to provide personalized travel recommendations.

CURRENT PHASE: Recommendation Generation

Based on the conversation history, generate 2-3 distinct travel plan options that match the user's preferences.

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON.

JSON FORMAT (respond with ONLY this structure, no additional text):
{
  "summary": "Brief overview of the recommendations (2-3 sentences)",
  "plans": [
    {
      "id": "plan-1",
      "destination": "City, Country",
      "country": "Country Name",
      "duration": {
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "nights": 0,
        "hours": 4
      },
      "budget": {
        "estimated": 150,
        "currency": "USD",
        "breakdown": {
          "admission": 65,
          "activities": 40,
          "food": 30,
          "transportation": 15
        }
      },
      "highlights": ["Place/Attraction 1", "Place/Attraction 2", "Place/Attraction 3"],
      "activities": ["Activity/Experience 1", "Activity/Experience 2", "Activity/Experience 3"],
      "accommodation": {
        "type": "hotel/hostel/resort/airbnb",
        "description": "Description of accommodation"
      },
      "transportation": {
        "arrival": "How to get there",
        "local": "How to get around locally"
      },
      "bestFor": ["type of traveler", "another type"],
      "considerations": ["important note 1", "important note 2"]
    }
  ],
  "metadata": {
    "generatedAt": "${new Date().toISOString()}",
    "basedOnPreferences": {
      "budget": "extracted budget info",
      "dates": "extracted date info",
      "interests": ["interest1", "interest2"],
      "constraints": ["constraint1"]
    }
  }
}

FIELD DEFINITIONS:
- "destination": The name of the attraction/location (e.g., "Grouse Mountain, Vancouver")
- "highlights": What makes this attraction SPECIAL/UNIQUE (features, views, experiences)
  Example for Grouse Mountain: ["Panoramic city views", "Grizzly bear habitat", "Alpine scenery"]
  NOT: ["Grouse Mountain"] - don't repeat the destination name!
- "activities": Specific things to DO at this attraction
  Example for Grouse Mountain: ["Ride the Skyride gondola", "Hike mountain trails", "Watch bear shows"]

CRITICAL RULES:
- Generate 2-3 SEPARATE plans (this means 2-3 items in the "plans" array)
- EACH plan focuses on ONE SINGLE attraction
- "highlights" = WHY this place is special (features, not the place name itself)
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
- All budget amounts should be in USD
- Dates should be realistic based on the conversation

EXAMPLE OUTPUT STRUCTURE:
{
  "summary": "...",
  "plans": [
    {
      "id": "plan-1",
      "destination": "Grouse Mountain, Vancouver",
      "highlights": ["Panoramic city views", "Grizzly bear habitat", "Alpine scenery"],
      "activities": ["Skyride gondola to summit", "Mountain hiking trails", "Grizzly bear shows"],
      "budget": {
        "estimated": 120,
        "currency": "USD",
        "breakdown": {
          "admission": 65,
          "activities": 20,
          "food": 25,
          "transportation": 10
        }
      }
    },
    {
      "id": "plan-2", 
      "destination": "Stanley Park, Vancouver",
      "highlights": ["Waterfront seawall", "Ancient totem poles", "Urban forest trails"],
      "activities": ["Bike the seawall", "Visit totem poles", "Beach picnics"],
      "budget": {
        "estimated": 45,
        "currency": "USD",
        "breakdown": {
          "admission": 0,
          "activities": 15,
          "food": 20,
          "transportation": 10
        }
      }
    }
  ]
}

Respond with ONLY the JSON object, no additional text`;
}

/**
 * Validate that the response is valid JSON with the expected structure
 * 
 * Requirements: 5.4
 */
function validateRecommendationResponse(jsonString: string): RecommendationResponse {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate required top-level fields
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid summary field');
    }

    if (!Array.isArray(parsed.plans) || parsed.plans.length === 0) {
      throw new Error('Plans must be a non-empty array');
    }
    
    // Trim to max 3 plans if AI generated too many
    if (parsed.plans.length > 3) {
      parsed.plans = parsed.plans.slice(0, 3);
    }

    // Validate each plan has required fields
    parsed.plans.forEach((plan: TravelPlan, index: number) => {
      if (!plan.destination || !plan.country) {
        throw new Error(`Plan ${index + 1} missing destination or country`);
      }
      if (!plan.duration || !plan.duration.startDate || !plan.duration.endDate) {
        throw new Error(`Plan ${index + 1} missing duration information`);
      }
      if (!plan.budget || typeof plan.budget.estimated !== 'number') {
        throw new Error(`Plan ${index + 1} missing budget information`);
      }
      if (!Array.isArray(plan.highlights) || plan.highlights.length === 0) {
        throw new Error(`Plan ${index + 1} missing highlights`);
      }
      if (!Array.isArray(plan.activities) || plan.activities.length === 0) {
        throw new Error(`Plan ${index + 1} missing activities`);
      }
    });

    return parsed as RecommendationResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response from AI');
    }
    throw error;
  }
}

/**
 * POST handler for /api/assistant
 * Receives conversation history and returns AI response
 * 
 * Requirements: 10.4, 3.1, 3.2
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AssistantRequest = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Messages array is required',
          code: 'INVALID_REQUEST',
          retryable: false
        },
        { status: 400 }
      );
    }

    // Validate messages structure
    for (const msg of body.messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'Each message must have role and content',
            code: 'INVALID_MESSAGE',
            retryable: false
          },
          { status: 400 }
        );
      }
    }

    // Analyze conversation to determine phase
    const { shouldGenerate, missingInfo } = shouldGenerateRecommendations(body.messages);

    let systemPrompt: string;
    let responseFormat: 'json' | 'text' = 'text';
    let maxTokens = 500;

    if (shouldGenerate) {
      // Phase 2: Generate recommendations
      systemPrompt = getRecommendationPrompt();
      responseFormat = 'json';
      maxTokens = 2000;
    } else {
      // Phase 1: Gather information
      systemPrompt = getInformationGatheringPrompt(missingInfo);
      responseFormat = 'text';
      maxTokens = 300;
    }

    // Construct messages array with system prompt
    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt,
        timestamp: Date.now()
      },
      ...body.messages
    ];

    // Call OpenRouter API
    const response = await openRouterClient.chat(messages, {
      temperature: 0.7,
      maxTokens,
      responseFormat
    });

    // Handle response based on phase
    if (shouldGenerate) {
      // Phase 2: Parse and validate recommendation response
      try {
        const recommendations = validateRecommendationResponse(response.content);
        
        const assistantResponse: AssistantResponse = {
          travelPlans: recommendations.plans,
          summary: recommendations.summary
        };

        return NextResponse.json(assistantResponse);
      } catch (validationError) {
        console.error('Validation error:', validationError);
        
        // Return error response
        return NextResponse.json(
          {
            error: 'Invalid response format',
            message: validationError instanceof Error 
              ? validationError.message 
              : 'The AI returned an invalid response format. Please try again.',
            code: 'VALIDATION_ERROR',
            retryable: true
          },
          { status: 500 }
        );
      }
    } else {
      // Phase 1: Return text response
      const assistantResponse: AssistantResponse = {
        message: response.content
      };

      return NextResponse.json(assistantResponse);
    }

  } catch (error) {
    console.error('API route error:', error);

    // Handle different error types
    if (error instanceof Error) {
      // Check for specific error messages from OpenRouter client
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Configuration error',
            message: 'The service is not properly configured. Please contact support.',
            code: 'CONFIG_ERROR',
            retryable: false
          },
          { status: 500 }
        );
      }

      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait a moment and try again.',
            code: 'RATE_LIMIT',
            retryable: true
          },
          { status: 429 }
        );
      }

      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          {
            error: 'Network error',
            message: 'Unable to connect to the AI service. Please check your connection and try again.',
            code: 'NETWORK_ERROR',
            retryable: true
          },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        retryable: true
      },
      { status: 500 }
    );
  }
}

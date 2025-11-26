# Design Document

## Overview

The Voice-Enabled Travel Advisor is a Next.js web application that enables users to interact with an AI assistant through voice input to receive personalized travel recommendations. The system uses the browser's Web Speech API for voice input, maintains conversation context in client-side state, and leverages OpenRouter's API to access cost-effective LLM models for generating travel recommendations.

The architecture follows a client-server pattern with a React-based frontend, Next.js API routes for backend logic, and external API integration with OpenRouter. The design prioritizes simplicity, cost-effectiveness, and rapid deployment while maintaining clean code organization and user experience quality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (React)                   │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Greeting   │  │    Voice     │  │   Results    │ │ │
│  │  │    Screen    │  │  Interaction │  │   Display    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │      Conversation State (React State)            │  │ │
│  │  │      - Message History                           │  │ │
│  │  │      - Current UI State                          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │      Web Speech API (Browser Native)             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              /api/assistant                             │ │
│  │  - Receives conversation history                       │ │
│  │  - Constructs prompts                                  │ │
│  │  - Manages conversation state logic                    │ │
│  │  - Validates responses                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         /lib/openrouter.ts                             │ │
│  │  - API client wrapper                                  │ │
│  │  - Error handling                                      │ │
│  │  - Request/response formatting                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenRouter API                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              LLM Model (e.g., GPT-3.5)                 │ │
│  │  - Processes conversation                              │ │
│  │  - Generates responses                                 │ │
│  │  - Returns structured JSON for travel plans            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: shadcn/ui for pre-built, accessible components
- **Voice Input**: Web Speech API (browser native)
- **State Management**: React useState/useReducer for conversation state
- **API Integration**: OpenRouter API for LLM access
- **Deployment**: Vercel (serverless, zero-config deployment)

### Model Selection

**Chosen Model**: `meta-llama/llama-3.2-3b-instruct:free` (Primary), with alternatives available

**Rationale**:
- Cost-effective: Completely free
- Sufficient capability for conversational AI and structured output
- Fast response times for good user experience
- JSON mode support for structured outputs
- Reliable and consistently available on OpenRouter
- Well within budget constraints

**Alternatives**:
- `qwen/qwen-2-7b-instruct:free` - Good quality, free
- `microsoft/phi-3-mini-128k-instruct:free` - Fast and free
- `anthropic/claude-3-haiku` - Higher quality option (low cost, paid)
- `openai/gpt-3.5-turbo` - Reliable option (low cost, paid)

## Components and Interfaces

### Frontend Components

#### 1. Main Page Component (`app/page.tsx`)

**Responsibilities**:
- Manage overall application state (conversation history, UI mode)
- Coordinate between child components
- Handle conversation flow logic
- Display greeting, conversation, and results

**State**:
```typescript
interface AppState {
  messages: Message[];
  travelPlans: TravelPlan[] | null;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

#### 2. VoiceRecorder Component (`components/VoiceRecorder.tsx`)

**Responsibilities**:
- Initialize and manage Web Speech API
- Provide visual feedback for recording state
- Handle speech recognition events
- Emit transcribed text to parent component

**Props**:
```typescript
interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}
```

**Internal State**:
```typescript
interface VoiceRecorderState {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
}
```

#### 3. TravelCard Component (`components/TravelCard.tsx`)

**Responsibilities**:
- Display a single travel plan in card format
- Present destination, budget, dates, activities
- Maintain consistent styling and layout

**Props**:
```typescript
interface TravelCardProps {
  plan: TravelPlan;
  index: number;
}
```

#### 4. ConversationDisplay Component (`components/ConversationDisplay.tsx`)

**Responsibilities**:
- Render conversation history
- Display user and assistant messages
- Auto-scroll to latest message
- Show loading states

**Props**:
```typescript
interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
}
```

#### 5. VoiceSynthesis Component (`components/VoiceSynthesis.tsx`)

**Responsibilities**:
- Initialize and manage Web Speech Synthesis API
- Convert text responses to speech
- Provide controls to stop/pause speech
- Handle browser compatibility
- Provide visual feedback during speech

**Props**:
```typescript
interface VoiceSynthesisProps {
  text: string | null;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
```

**Internal State**:
```typescript
interface VoiceSynthesisState {
  isSpeaking: boolean;
  isSupported: boolean;
  isPaused: boolean;
}
```

### Backend Components

#### 1. API Route (`app/api/assistant/route.ts`)

**Responsibilities**:
- Receive conversation history from frontend
- Determine conversation phase (gathering info vs. generating plans)
- Construct appropriate system prompts
- Call OpenRouter service
- Validate and parse responses
- Return formatted response

**Request Interface**:
```typescript
interface AssistantRequest {
  messages: Message[];
}
```

**Response Interface**:
```typescript
interface AssistantResponse {
  message?: string;
  travelPlans?: TravelPlan[];
  summary?: string;
  error?: string;
}
```

#### 2. OpenRouter Client (`lib/openrouter.ts`)

**Responsibilities**:
- Wrap OpenRouter API calls
- Handle authentication
- Format requests according to OpenRouter spec
- Parse responses
- Handle errors and retries

**Interface**:
```typescript
interface OpenRouterClient {
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## Data Models

### Message
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
```

### TravelPlan
```typescript
interface TravelPlan {
  id: string;
  destination: string;
  country: string;
  duration: {
    startDate: string;
    endDate: string;
    nights: number;
  };
  budget: {
    estimated: number;
    currency: string;
    breakdown: {
      flights: number;
      accommodation: number;
      activities: number;
      food: number;
      other: number;
    };
  };
  highlights: string[];
  activities: string[];
  accommodation: {
    type: string;
    description: string;
  };
  transportation: {
    arrival: string;
    local: string;
  };
  bestFor: string[];
  considerations: string[];
}
```

### Recommendation Response
```typescript
interface RecommendationResponse {
  summary: string;
  plans: TravelPlan[];
  metadata: {
    generatedAt: string;
    basedOnPreferences: {
      budget?: string;
      dates?: string;
      interests?: string[];
      constraints?: string[];
    };
  };
}
```

## Conversation Flow Design

### Phase 1: Information Gathering

The AI assistant follows a structured approach to gather necessary information:

1. **Initial Greeting**: Welcome user and explain the service
2. **Gather Core Requirements**:
   - Destination preferences (specific places, regions, or types)
   - Travel dates or timeframe
   - Budget range
   - Travel party size and composition
3. **Gather Additional Context**:
   - Interests and activities
   - Constraints (dietary, accessibility, etc.)
   - Accommodation preferences
4. **Confirmation**: Summarize gathered information and confirm

### Phase 2: Recommendation Generation

Once sufficient information is gathered:

1. **Signal Transition**: "Let me create some personalized travel plans for you..."
2. **Generate Plans**: Create 2-3 distinct options
3. **Return Structured Response**: JSON with plans and summary

### Conversation State Management

The system determines which phase to be in based on conversation analysis:

```typescript
function analyzeConversationCompleteness(messages: Message[]): {
  isComplete: boolean;
  missingInfo: string[];
} {
  // Extract information from conversation
  // Check for: destination, dates, budget, interests
  // Return completeness status
}
```

The API route uses this analysis to decide whether to:
- Ask follow-up questions (Phase 1)
- Generate recommendations (Phase 2)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Recording state visual feedback

*For any* voice recording state change (start/stop), the UI should display appropriate visual feedback indicating the current recording status
**Validates: Requirements 2.2**

### Property 2: Error message display on speech recognition failure

*For any* speech recognition error, the system should display an error message and provide a retry mechanism
**Validates: Requirements 2.4**

### Property 3: Conversation history inclusion in API calls

*For any* API call to /api/assistant, the request should include all previous messages from the current session
**Validates: Requirements 3.1, 3.2**

### Property 4: Response storage in conversation history

*For any* AI response received, the response should be appended to the conversation history in browser memory
**Validates: Requirements 3.3**

### Property 5: Message ordering in conversation history

*For any* new user message, it should appear in the conversation history before the API call is made
**Validates: Requirements 3.4**

### Property 6: Context persistence across interactions

*For any* sequence of voice interactions within a session, all previous messages should remain accessible in the conversation context
**Validates: Requirements 3.5**

### Property 7: Information completeness determination

*For any* user input, the system should correctly determine whether sufficient information exists to generate travel recommendations
**Validates: Requirements 4.1**

### Property 8: Follow-up questions for incomplete information

*For any* incomplete travel requirements, the system should ask specific follow-up questions about the missing information
**Validates: Requirements 4.2**

### Property 9: Question relevance to required information

*For any* follow-up question asked by the AI, it should relate to one of the required information categories (dates, budget, destination, constraints, or interests)
**Validates: Requirements 4.3**

### Property 10: Recommendation generation on sufficient information

*For any* conversation state containing all required travel information, the system should proceed to generate travel recommendations
**Validates: Requirements 4.4, 4.5**

### Property 11: Travel plan count constraint

*For any* successful recommendation generation, the response should contain between 2 and 3 distinct travel plans
**Validates: Requirements 5.1**

### Property 12: Structured JSON response format

*For any* generated travel recommendations, the response should be valid JSON containing plan details and a summary
**Validates: Requirements 5.2**

### Property 13: Required fields in travel plans

*For any* generated travel plan, it should include destination, estimated budget, suggested dates, and key activities
**Validates: Requirements 5.3**

### Property 14: JSON validation before frontend delivery

*For any* LLM response received, the system should validate the JSON structure before sending it to the frontend
**Validates: Requirements 5.4**

### Property 15: AI response display in conversation interface

*For any* text response from the AI, it should be displayed in the conversation interface
**Validates: Requirements 6.1**

### Property 16: Summary section display with recommendations

*For any* travel plan recommendations received, a summary section should be displayed at the top of the results
**Validates: Requirements 6.2**

### Property 17: Card rendering for each travel plan

*For any* set of travel plans, each plan should be rendered as a distinct card component
**Validates: Requirements 6.3**

### Property 18: Required information in travel cards

*For any* rendered travel card, it should display destination, budget, dates, and highlights
**Validates: Requirements 6.4**

### Property 19: Conversation history display

*For any* conversation state, the complete message history should be displayed in the interface
**Validates: Requirements 6.7**

### Property 20: API error handling with user-friendly messages

*For any* OpenRouter API call failure, the system should return a user-friendly error message to the user
**Validates: Requirements 11.2**

### Property 21: Network error feedback and retry

*For any* network error, the system should provide clear feedback and offer retry options
**Validates: Requirements 11.3**

### Property 22: Invalid JSON error handling

*For any* invalid JSON response from the LLM, the system should handle the parsing error and notify the user
**Validates: Requirements 11.4**

### Property 23: Voice synthesis for AI responses

*For any* text response from the AI, the system should use the Web Speech Synthesis API to speak the response aloud
**Validates: Requirements 8.1**

### Property 24: Visual feedback during voice output

*For any* active voice synthesis, the UI should display visual feedback indicating speech is in progress
**Validates: Requirements 8.2**

### Property 25: Voice summary for recommendations

*For any* travel plan recommendations, the system should speak a summary of the recommendations aloud
**Validates: Requirements 8.3**

### Property 26: Speech interruption on new response

*For any* new AI response that arrives while previous speech is playing, the system should stop the previous speech before starting the new one
**Validates: Requirements 8.6**

## Error Handling

### Frontend Error Handling

1. **Web Speech API Errors (Recognition)**:
   - Check for browser support on component mount
   - Display clear message if API is unavailable
   - Handle recognition errors (no-speech, audio-capture, network)
   - Provide retry mechanism for transient errors

2. **Web Speech Synthesis API Errors**:
   - Check for browser support on component mount
   - Gracefully fall back to text-only if synthesis unavailable
   - Handle synthesis errors (interrupted, cancelled)
   - Provide manual controls to stop/restart speech

3. **API Call Errors**:
   - Wrap API calls in try-catch blocks
   - Display user-friendly error messages
   - Maintain conversation state even on errors
   - Provide retry button for failed requests

4. **State Management Errors**:
   - Validate message structure before adding to history
   - Handle edge cases (empty messages, malformed data)
   - Graceful degradation if state becomes corrupted

### Backend Error Handling

1. **OpenRouter API Errors**:
   - Handle authentication errors (invalid API key)
   - Handle rate limiting (429 responses)
   - Handle timeout errors
   - Handle invalid model errors
   - Return structured error responses to frontend

2. **JSON Parsing Errors**:
   - Validate LLM response structure
   - Handle malformed JSON gracefully
   - Provide fallback responses if parsing fails
   - Log errors for debugging

3. **Request Validation**:
   - Validate incoming request structure
   - Check for required fields
   - Sanitize user input
   - Return 400 errors for invalid requests

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  retryable: boolean;
}
```

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests, chosen for its speed, native TypeScript support, and excellent integration with Vite-based projects like Next.js.

**Unit Test Coverage**:

1. **Component Tests**:
   - VoiceRecorder: Test state transitions, event handling, error cases
   - VoiceSynthesis: Test speech synthesis, controls, browser compatibility
   - TravelCard: Test rendering with various plan data
   - ConversationDisplay: Test message rendering, scrolling behavior

2. **API Route Tests**:
   - Test request validation
   - Test conversation phase detection
   - Test response formatting
   - Test error handling paths

3. **Utility Function Tests**:
   - OpenRouter client: Test request formatting, error handling
   - Conversation analysis: Test information completeness detection
   - JSON validation: Test schema validation logic

**Example Unit Test**:
```typescript
describe('VoiceRecorder', () => {
  it('should emit transcript when speech recognition completes', () => {
    const onTranscript = vi.fn();
    render(<VoiceRecorder onTranscript={onTranscript} />);
    
    // Simulate speech recognition
    const mockRecognition = getMockSpeechRecognition();
    mockRecognition.triggerResult('Hello, I want to travel to Japan');
    
    expect(onTranscript).toHaveBeenCalledWith('Hello, I want to travel to Japan');
  });
});
```

### Property-Based Testing

The application will use **fast-check** as the property-based testing library, chosen for its excellent TypeScript support, comprehensive generator library, and active maintenance.

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Test Tagging**: Each property-based test will include a comment explicitly referencing the correctness property from this design document using the format: `**Feature: voice-travel-advisor, Property {number}: {property_text}**`

**Property Test Coverage**:

1. **Conversation History Properties**:
   - Property 3: Test that API calls always include full conversation history
   - Property 4: Test that responses are always added to history
   - Property 5: Test that message ordering is preserved
   - Property 6: Test that context persists across multiple interactions

2. **Recommendation Generation Properties**:
   - Property 11: Test that recommendation count is always 2-3
   - Property 13: Test that all plans contain required fields
   - Property 17: Test that each plan gets a card component

3. **Error Handling Properties**:
   - Property 2: Test that all error types produce error messages
   - Property 20: Test that API failures return user-friendly messages
   - Property 22: Test that invalid JSON is handled gracefully

4. **Voice Synthesis Properties**:
   - Property 23: Test that all AI responses trigger voice synthesis
   - Property 24: Test that visual feedback appears during speech
   - Property 26: Test that new responses interrupt previous speech

**Example Property Test**:
```typescript
/**
 * Feature: voice-travel-advisor, Property 3: Conversation history inclusion in API calls
 */
test('API calls always include complete conversation history', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        role: fc.constantFrom('user', 'assistant'),
        content: fc.string({ minLength: 1 }),
        timestamp: fc.integer({ min: 0 })
      }), { minLength: 1, maxLength: 20 }),
      async (messages) => {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          body: JSON.stringify({ messages })
        });
        
        const requestBody = getLastRequestBody();
        expect(requestBody.messages).toHaveLength(messages.length);
        expect(requestBody.messages).toEqual(messages);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**Scope**: End-to-end user flows using Playwright or similar

1. **Complete Conversation Flow**:
   - User starts conversation
   - Provides travel requirements over multiple turns
   - Receives recommendations
   - Views travel cards

2. **Error Recovery Flow**:
   - Trigger API error
   - Verify error message display
   - Retry and succeed

3. **Browser Compatibility**:
   - Test Web Speech API availability detection
   - Test fallback behavior

### Manual Testing Checklist

1. Voice input works in Chrome, Edge, Safari
2. Conversation flows naturally
3. Recommendations are relevant and well-formatted
4. UI is responsive and accessible
5. Error messages are clear and helpful
6. Deployment works on Vercel

## Prompt Engineering Strategy

### System Prompt Design

The system prompt is critical for guiding the LLM's behavior. It will be structured as follows:

```
You are a helpful travel advisor assistant. Your role is to gather travel requirements from users through natural conversation and then provide personalized travel recommendations.

CONVERSATION PHASES:
1. Information Gathering: Ask questions to understand the user's travel needs
2. Recommendation: Once you have sufficient information, provide 2-3 travel plan options

REQUIRED INFORMATION:
- Destination preferences (specific places, regions, or types of destinations)
- Travel dates or timeframe
- Budget range
- Interests and preferred activities
- Any constraints (dietary, accessibility, etc.)

GUIDELINES:
- Be conversational and friendly
- Ask one or two questions at a time
- Confirm understanding before generating recommendations
- When ready to provide recommendations, respond with ONLY a JSON object (no additional text)

JSON FORMAT for recommendations:
{
  "summary": "Brief overview of the recommendations",
  "plans": [
    {
      "destination": "City, Country",
      "duration": { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "nights": number },
      "budget": { "estimated": number, "currency": "USD", "breakdown": {...} },
      "highlights": ["highlight1", "highlight2"],
      "activities": ["activity1", "activity2"],
      "accommodation": { "type": "hotel/hostel/etc", "description": "..." },
      "transportation": { "arrival": "...", "local": "..." },
      "bestFor": ["type of traveler"],
      "considerations": ["important notes"]
    }
  ]
}
```

### Conversation Phase Detection

The API route will analyze the conversation to determine if sufficient information has been gathered:

```typescript
function shouldGenerateRecommendations(messages: Message[]): boolean {
  const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
  
  const hasDestination = /\b(want to|going to|visit|travel to)\s+\w+/.test(conversationText);
  const hasBudget = /\$\d+|budget|spend|afford/.test(conversationText);
  const hasDates = /\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|next (week|month|year)|in \d+ (days|weeks|months)/.test(conversationText);
  
  // Need at least destination and one other piece of info
  return hasDestination && (hasBudget || hasDates);
}
```

### Token Optimization

To minimize costs:

1. **Concise System Prompt**: Keep instructions clear but brief
2. **Conversation Pruning**: After 10+ messages, summarize early context
3. **Efficient Model**: Use Llama 3.1 8B or Gemini Flash (fast and cheap)
4. **Max Tokens Limit**: Set reasonable limits (500 for questions, 1500 for recommendations)

## Deployment Strategy

### Environment Configuration

**Required Environment Variables**:
```
OPENROUTER_API_KEY=sk-or-v1-...
```

**Optional Environment Variables**:
```
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Vercel Deployment

1. **Setup**:
   - Connect GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Enable automatic deployments on push

2. **Build Configuration**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Serverless Functions**:
   - API routes automatically deployed as serverless functions
   - No additional configuration needed
   - Cold start optimization through minimal dependencies

### Performance Considerations

1. **Client-Side**:
   - Code splitting for components
   - Lazy loading for heavy components
   - Optimized bundle size with tree shaking

2. **Server-Side**:
   - Efficient API route handlers
   - Minimal dependencies in serverless functions
   - Response caching where appropriate

3. **API Calls**:
   - Timeout handling (30s max)
   - Retry logic for transient failures
   - Rate limiting awareness

## Security Considerations

1. **API Key Protection**:
   - Store OpenRouter API key in environment variables
   - Never expose in client-side code
   - Use server-side API routes for all LLM calls

2. **Input Validation**:
   - Sanitize user input before sending to LLM
   - Validate conversation history structure
   - Limit message length and history size

3. **Rate Limiting**:
   - Implement client-side debouncing
   - Consider server-side rate limiting for production
   - Handle 429 responses gracefully

4. **CORS**:
   - Configure appropriate CORS headers
   - Restrict API access to same origin

## Architecture Trade-offs and Future Improvements

### Current Trade-offs

1. **No Persistent Storage**:
   - **Pro**: Simpler architecture, lower cost, faster deployment
   - **Con**: Users lose conversation history on refresh
   - **Future**: Add optional localStorage persistence or database for logged-in users

2. **Client-Side State Management**:
   - **Pro**: Simple, no backend state management needed
   - **Con**: State lost on page refresh
   - **Future**: Consider session storage or URL state for resilience

3. **Single-Turn Voice Input**:
   - **Pro**: Simpler implementation, works with Web Speech API
   - **Con**: Not true real-time conversation
   - **Future**: Explore WebRTC + LiveKit for streaming audio

4. **Basic Conversation Analysis**:
   - **Pro**: Fast, deterministic, no extra API calls
   - **Con**: May miss nuanced information
   - **Future**: Use LLM to analyze conversation completeness

5. **Basic Voice Output**:
   - **Pro**: More immersive experience, natural conversation flow
   - **Con**: Browser compatibility varies, adds complexity
   - **Implementation**: Using Web Speech Synthesis API for text-to-speech
   - **Future**: Explore more natural-sounding voices via cloud TTS services (Google Cloud TTS, Amazon Polly)

### Future Improvements

1. **Enhanced Features**:
   - User accounts and saved conversations
   - Favorite/bookmark travel plans
   - Share recommendations via link
   - Multi-language support
   - Voice output for AI responses
   - Image generation for destinations

2. **Technical Improvements**:
   - Streaming responses for faster perceived performance
   - Better conversation state management (XState)
   - Comprehensive error tracking (Sentry)
   - Analytics for user behavior
   - A/B testing for prompts

3. **AI Improvements**:
   - Fine-tuned model for travel recommendations
   - RAG integration with real travel data
   - Multi-modal input (images of destinations)
   - Personalization based on user history

4. **Production Readiness**:
   - Comprehensive test coverage (>80%)
   - Performance monitoring
   - User feedback mechanism
   - Accessibility audit and improvements
   - SEO optimization

## File Structure

```
voice-travel-advisor/
├── app/
│   ├── page.tsx                 # Main page component
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── api/
│       └── assistant/
│           └── route.ts         # API route for LLM interaction
├── components/
│   ├── VoiceRecorder.tsx        # Voice input component
│   ├── VoiceSynthesis.tsx       # Voice output component
│   ├── TravelCard.tsx           # Travel plan card component
│   ├── ConversationDisplay.tsx  # Message history display
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── openrouter.ts            # OpenRouter API client
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
├── __tests__/
│   ├── unit/
│   │   ├── VoiceRecorder.test.tsx
│   │   ├── TravelCard.test.tsx
│   │   └── openrouter.test.ts
│   └── properties/
│       ├── conversation.test.ts
│       ├── recommendations.test.ts
│       └── errors.test.ts
├── public/
│   └── ...                      # Static assets
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Example environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── vitest.config.ts             # Vitest configuration
└── README.md                    # Project documentation
```

## Development Workflow

1. **Setup**: Clone repo, install dependencies, configure environment variables
2. **Development**: Run `npm run dev` for local development server
3. **Testing**: Run `npm test` for unit tests, `npm run test:properties` for property tests
4. **Build**: Run `npm run build` to create production build
5. **Deploy**: Push to GitHub, automatic deployment via Vercel
6. **Monitor**: Check Vercel logs and analytics for issues

## Success Criteria

The implementation will be considered successful when:

1. ✅ User can interact with the app using voice input
2. ✅ AI conducts natural conversation to gather travel requirements
3. ✅ System generates 2-3 relevant travel recommendations
4. ✅ Recommendations are displayed in clean, card-based UI
5. ✅ Application is deployed and accessible via public URL
6. ✅ Total API costs remain under $2
7. ✅ Setup time is under 5 minutes for new developers
8. ✅ All critical user flows work without errors
9. ✅ Code is well-organized and maintainable
10. ✅ Documentation is comprehensive and clear

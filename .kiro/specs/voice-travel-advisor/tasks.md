# Implementation Plan

- [x] 1. Initialize Next.js project with TypeScript and dependencies






  - Create Next.js 14+ project with App Router
  - Install TypeScript, Tailwind CSS, shadcn/ui
  - Configure Tailwind and TypeScript settings
  - Set up project structure (app/, components/, lib/ directories)
  - Create .env.example with required environment variables
  - _Requirements: 10.5, 9.2_

- [x] 2. Set up core type definitions and interfaces





  - Create lib/types.ts with Message, TravelPlan, RecommendationResponse interfaces
  - Define API request/response types
  - Define component prop types
  - _Requirements: 10.5_

- [x] 3. Implement OpenRouter API client





  - Create lib/openrouter.ts with API client wrapper
  - Implement chat() method with proper request formatting
  - Add error handling for API failures
  - Add request/response logging for debugging
  - Configure model selection and token limits
  - _Requirements: 10.3, 7.1, 7.2, 7.3_

- [ ]* 3.1 Write unit tests for OpenRouter client
  - Test request formatting
  - Test error handling for various failure modes
  - Test response parsing
  - _Requirements: 11.2_

- [x] 4. Create API route for assistant endpoint





  - Create app/api/assistant/route.ts
  - Implement POST handler to receive conversation history
  - Add conversation analysis logic to determine if information is complete
  - Construct system prompt for information gathering phase
  - Construct system prompt for recommendation generation phase
  - Call OpenRouter client with appropriate prompts
  - Validate and parse LLM responses
  - Return formatted responses to frontend
  - _Requirements: 10.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.4_

- [ ]* 4.1 Write property test for conversation history inclusion
  - **Property 3: Conversation history inclusion in API calls**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 4.2 Write property test for information completeness determination
  - **Property 7: Information completeness determination**
  - **Validates: Requirements 4.1**

- [ ]* 4.3 Write property test for JSON validation
  - **Property 14: JSON validation before frontend delivery**
  - **Validates: Requirements 5.4**

- [ ]* 4.4 Write unit tests for API route
  - Test request validation
  - Test conversation phase detection
  - Test error responses
  - _Requirements: 11.2, 11.4_

- [x] 5. Install and configure shadcn/ui components




  - Initialize shadcn/ui
  - Install button, card, alert components
  - Configure component styling with Tailwind
  - _Requirements: 10.5_

- [x] 6. Create VoiceRecorder component





  - Create components/VoiceRecorder.tsx
  - Initialize Web Speech API on component mount
  - Check for browser support and display error if unavailable
  - Implement start/stop recording functionality
  - Add visual feedback for recording state (button styling, icons)
  - Handle speech recognition events (result, error, end)
  - Emit transcribed text to parent via onTranscript callback
  - Handle errors and emit via onError callback
  - Add interim transcript display for real-time feedback
  - _Requirements: 10.1, 2.1, 2.2, 2.3, 2.4, 2.5, 11.1_

- [ ]* 6.1 Write property test for recording state visual feedback
  - **Property 1: Recording state visual feedback**
  - **Validates: Requirements 2.2**

- [ ]* 6.2 Write property test for error message display
  - **Property 2: Error message display on speech recognition failure**
  - **Validates: Requirements 2.4**

- [ ]* 6.3 Write unit tests for VoiceRecorder
  - Test Web Speech API initialization
  - Test recording state transitions
  - Test transcript emission
  - Test error handling
  - _Requirements: 2.1, 2.3, 2.4, 11.1_

- [x] 7. Create TravelCard component





  - Create components/TravelCard.tsx
  - Design card layout with shadcn/ui Card component
  - Display destination and country prominently
  - Show duration (dates and nights)
  - Display budget with breakdown
  - List highlights and activities
  - Show accommodation and transportation details
  - Display bestFor and considerations sections
  - Style with Tailwind for clean, minimal design
  - _Requirements: 10.2, 6.3, 6.4_

- [ ]* 7.1 Write property test for required information in travel cards
  - **Property 18: Required information in travel cards**
  - **Validates: Requirements 6.4**

- [ ]* 7.2 Write unit tests for TravelCard
  - Test rendering with complete plan data
  - Test rendering with minimal plan data
  - Test styling and layout
  - _Requirements: 6.3, 6.4_

- [x] 8. Create ConversationDisplay component





  - Create components/ConversationDisplay.tsx
  - Render message history with user/assistant distinction
  - Style user messages differently from assistant messages
  - Add timestamps to messages
  - Implement auto-scroll to latest message
  - Show loading indicator when isLoading is true
  - Handle empty conversation state
  - _Requirements: 6.1, 6.7_

- [ ]* 8.1 Write property test for AI response display
  - **Property 15: AI response display in conversation interface**
  - **Validates: Requirements 6.1**

- [ ]* 8.2 Write property test for conversation history display
  - **Property 19: Conversation history display**
  - **Validates: Requirements 6.7**

- [ ]* 8.3 Write unit tests for ConversationDisplay
  - Test message rendering
  - Test user vs assistant message styling
  - Test loading state
  - Test auto-scroll behavior
  - _Requirements: 6.1, 6.7_

- [ ] 8.5 Create VoiceSynthesis component
  - Create components/VoiceSynthesis.tsx
  - Initialize Web Speech Synthesis API on component mount
  - Check for browser support and gracefully fall back to text-only if unavailable
  - Implement speak() method to convert text to speech
  - Add controls to stop/pause speech
  - Provide visual feedback when speech is in progress (speaking indicator)
  - Handle synthesis events (start, end, error, pause, resume)
  - Implement speech interruption - stop previous speech when new text arrives
  - Configure voice settings (rate, pitch, volume)
  - Select appropriate voice from available system voices
  - Emit callbacks for onStart, onEnd, onError events
  - _Requirements: 8.1, 8.2, 8.5, 8.6_

- [ ]* 8.6 Write property test for voice synthesis
  - **Property 23: Voice synthesis for AI responses**
  - **Validates: Requirements 8.1**

- [ ]* 8.7 Write property test for visual feedback during voice output
  - **Property 24: Visual feedback during voice output**
  - **Validates: Requirements 8.2**

- [ ]* 8.8 Write property test for speech interruption
  - **Property 26: Speech interruption on new response**
  - **Validates: Requirements 8.6**

- [ ]* 8.9 Write unit tests for VoiceSynthesis
  - Test Web Speech Synthesis API initialization
  - Test browser support detection
  - Test speak functionality
  - Test stop/pause controls
  - Test speech interruption logic
  - Test error handling
  - _Requirements: 8.1, 8.4, 8.5, 8.6_

- [x] 9. Implement main page component with state management





  - Create app/page.tsx as main application component
  - Initialize state for messages, travelPlans, summary, isLoading, error
  - Implement greeting screen with "Start Talking" button
  - Handle voice transcript from VoiceRecorder
  - Add user message to conversation history
  - Call /api/assistant with conversation history
  - Handle API response (text response or travel plans)
  - Add assistant message to conversation history
  - Update UI based on response type
  - Integrate VoiceSynthesis component to speak AI responses
  - Pass AI response text to VoiceSynthesis for text-to-speech
  - Handle voice synthesis state (speaking indicator)
  - Implement error handling and display
  - _Requirements: 1.1, 1.2, 3.3, 3.4, 3.5, 6.1, 6.2, 8.1, 8.2, 8.3_

- [ ]* 9.1 Write property test for response storage in conversation history
  - **Property 4: Response storage in conversation history**
  - **Validates: Requirements 3.3**

- [ ]* 9.2 Write property test for message ordering
  - **Property 5: Message ordering in conversation history**
  - **Validates: Requirements 3.4**

- [ ]* 9.3 Write property test for context persistence
  - **Property 6: Context persistence across interactions**
  - **Validates: Requirements 3.5**

- [ ]* 9.4 Write property test for summary section display
  - **Property 16: Summary section display with recommendations**
  - **Validates: Requirements 6.2**

- [ ]* 9.5 Write property test for card rendering
  - **Property 17: Card rendering for each travel plan**
  - **Validates: Requirements 6.3**

- [ ]* 9.6 Write property test for voice summary of recommendations
  - **Property 25: Voice summary for recommendations**
  - **Validates: Requirements 8.3**

- [x] 10. Style the application with Tailwind CSS




  - Create app/globals.css with base styles
  - Style greeting screen with centered layout
  - Style conversation interface with message bubbles
  - Style results section with grid layout for cards
  - Add responsive design for mobile devices
  - Ensure clean, minimal aesthetic throughout
  - Add loading states and transitions
  - _Requirements: 6.5_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Add comprehensive error handling



  - Add error boundaries for React components
  - Implement retry mechanism for failed API calls
  - Add user-friendly error messages for all error types
  - Handle network errors gracefully
  - Handle invalid JSON responses from LLM
  - Add error state to UI with clear feedback
  - _Requirements: 11.2, 11.3, 11.4_

- [ ]* 12.1 Write property test for API error handling
  - **Property 20: API error handling with user-friendly messages**
  - **Validates: Requirements 11.2**

- [ ]* 12.2 Write property test for network error feedback
  - **Property 21: Network error feedback and retry**
  - **Validates: Requirements 11.3**

- [ ]* 12.3 Write property test for invalid JSON handling
  - **Property 22: Invalid JSON error handling**
  - **Validates: Requirements 11.4**

- [x] 13. Create comprehensive README documentation



  - Create README.md with project overview
  - Add setup instructions for local development
  - Document environment variable configuration
  - Explain model choice and rationale
  - Describe architecture and key components
  - Document key trade-offs made
  - List future improvements
  - Add deployment instructions for Vercel
  - Include troubleshooting section
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 14. Configure deployment settings
  - Create vercel.json if needed for custom configuration
  - Verify environment variables are set in Vercel dashboard
  - Test build process locally
  - Ensure API routes work in serverless environment
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 15. Final testing and polish
  - Test complete user flow end-to-end
  - Test voice input in multiple browsers
  - Verify conversation context is maintained
  - Verify travel recommendations are relevant and well-formatted
  - Test error scenarios and recovery
  - Check responsive design on mobile
  - Verify deployment works correctly
  - _Requirements: 1.1, 2.1, 3.5, 5.1, 5.2, 5.3, 6.2, 6.3, 6.4_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Future Enhancements

- [x] 17. Implement Interactive Map Mode





  - Install and configure Leaflet for interactive map display
    - Run: `npm install leaflet react-leaflet @types/leaflet`
    - Import Leaflet CSS in globals.css
    - Create MapView component with Leaflet map
  - Add "Map Mode" button on greeting screen (already present, needs implementation)
  - Create map page/component that displays full-screen interactive world map
  - Implement click handler to capture coordinates (latitude, longitude) on map click
  - Integrate Nominatim API (OpenStreetMap) for reverse geocoding
    - No API key required - public API
    - Endpoint: `https://nominatim.openstreetmap.org/reverse`
    - Add User-Agent header with app name
    - Convert coordinates to location names (city, region, country)
  - Integrate OpenTripMap API for nearby attractions
    - Optional: Get free API key from https://opentripmap.io/product (1,000 requests/day)
    - Works without API key for basic usage
    - Endpoint: `https://api.opentripmap.com/0.1/en/places/`
    - Fetch tourist attractions, museums, landmarks within radius
  - Create multi-radius search strategy:
    - Search 1: Immediate area (5km radius) for local attractions using OpenTripMap
    - Search 2: Regional area (50km radius) for nearby attractions
    - Search 3: Major cities (150km radius) using Nominatim search
  - Filter OpenTripMap results by place kinds (interesting_places, tourist_facilities, cultural, natural)
  - Sort results by distance and rating/importance
  - Create API route `/api/map-recommendations` to handle map-based queries
  - Send location data and nearby places to OpenRouter LLM for curated recommendations
  - Create prompt that includes:
    - Clicked location name and coordinates
    - List of nearby attractions with distances from OpenTripMap
    - Major cities within reasonable travel distance
    - Request for recommendations including local activities and day trip options
  - Display recommendations using existing TravelCard components in floating panel
  - Add map markers for recommended locations
  - Implement zoom and pan controls (built into Leaflet)
  - Add a Back button exactly like in the voice mode
  - Handle edge cases:
    - Ocean/water clicks (show nearest coastal cities)
    - Remote areas with no attractions (expand search radius)
    - API failures (graceful fallback messages)
  - Add loading states while fetching location data
  - Style map with custom markers and popups
  - _Future Feature: Interactive map-based travel discovery_
  - _Tech Stack: Leaflet (map), Nominatim (geocoding), OpenTripMap (attractions) - All FREE!_
  - _Note: No API keys required to start, optional OpenTripMap key for higher limits_

- [ ] 18. Implement Rate Limiting and Cost Protection
  - Add IP-based rate limiting to API routes (e.g., 10 requests per hour per IP)
  - Implement request tracking with Map or Redis
  - Add rate limit headers to responses (X-RateLimit-Remaining, X-RateLimit-Reset)
  - Create user-friendly error message for rate limit exceeded (429 status)
  - Set spending limits on OpenRouter dashboard ($5-10 monthly cap)
  - Add email alerts for approaching spending limits
  - Implement optional authentication system (NextAuth.js) for approved users
  - Create "Demo Mode" with cached/mock responses for public visitors
  - Add banner indicating demo mode vs. real mode
  - Track and log API usage for monitoring
  - Consider implementing per-user limits if authentication is added
  - Add admin dashboard to monitor usage and costs (optional)
  - _Future Feature: Protect against API cost abuse and manage budget_
  - _Priority: High for public deployment_

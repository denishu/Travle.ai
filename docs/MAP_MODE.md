# Map Mode Documentation

## Overview

The Interactive Map Mode allows users to explore travel destinations visually by clicking anywhere on a world map. The system automatically discovers nearby attractions, cities, and generates personalized travel recommendations for the selected location.

## Features Implemented

### 1. Interactive World Map
- Full-screen Leaflet map with OpenStreetMap tiles
- Click anywhere to select a location
- Zoom and pan controls (built into Leaflet)
- Visual markers for clicked location and nearby attractions

### 2. Location Discovery
- **Reverse Geocoding**: Uses Nominatim API to convert coordinates to location names
- **Nearby Attractions**: Fetches points of interest using OpenTripMap API
- **Multi-radius Search**: Searches at 5km and 50km radii for comprehensive coverage
- **Nearby Cities**: Discovers major cities within reasonable travel distance

### 3. Smart Recommendations
- AI-powered travel plan generation using OpenRouter LLM
- Handles edge cases:
  - Ocean/water clicks → Suggests coastal cities and beach destinations
  - Remote areas → Focuses on adventure and nature experiences
  - Urban areas → Highlights attractions and day trip options
- Generates 2-3 diverse travel plans per location

### 4. User Interface
- Clean header with back button
- Loading states while fetching data
- Error handling with user-friendly messages
- Floating panel for travel recommendations
- Reuses existing TravelCard components for consistency

## Technical Implementation

### Components

#### MapView Component (`components/MapView.tsx`)
- Main map interface component
- Handles map clicks and coordinate capture
- Manages state for location data and recommendations
- Integrates with external APIs (Nominatim, OpenTripMap)
- Displays markers and popups

#### Map Recommendations API (`app/api/map-recommendations/route.ts`)
- Server-side API route for generating recommendations
- Constructs context-aware prompts for the LLM
- Handles edge cases (water, remote areas)
- Validates and parses LLM responses
- Returns structured travel plans

### External APIs Used

1. **Nominatim (OpenStreetMap)**
   - Endpoint: `https://nominatim.openstreetmap.org/reverse`
   - Purpose: Reverse geocoding (coordinates → location names)
   - Cost: FREE (no API key required)
   - Rate limit: Respectful usage with User-Agent header

2. **OpenTripMap**
   - Endpoint: `https://api.opentripmap.com/0.1/en/places/`
   - Purpose: Discover tourist attractions and points of interest
   - Cost: FREE for basic usage (optional API key for higher limits)
   - Features: Filters by place kinds, sorts by distance and rating
   - Limitation: Poor coverage in some regions (especially China)

3. **Wikipedia Geosearch (Fallback)**
   - Endpoint: `https://en.wikipedia.org/w/api.php?action=query&list=geosearch`
   - Purpose: Find notable places when OpenTripMap has no data
   - Cost: FREE
   - Coverage: Much better for areas like China, Asia, etc.

4. **OpenRouter (LLM)**
   - Purpose: Generate personalized travel recommendations
   - Uses existing OpenRouter client
   - Cost-effective model selection

### Data Flow

1. User clicks on map → Coordinates captured
2. Reverse geocoding → Location name retrieved
3. Multi-radius search → Nearby attractions fetched
4. Nearby cities search → Major cities discovered
5. API call to `/api/map-recommendations` with all context
6. LLM generates 2-3 travel plans
7. Results displayed in floating panel

## Usage

### For Users

1. Click "Explore Map" button on the home screen
2. Click anywhere on the world map
3. Wait for the system to discover attractions (loading indicator shown)
4. View personalized travel recommendations in the floating panel
5. Click "Back" to return to the home screen

### For Developers

#### Adding New Map Features

To add new markers or overlays:
```typescript
<Marker position={[lat, lng]} icon={customIcon}>
  <Popup>Your content here</Popup>
</Marker>
```

#### Customizing Search Radius

Edit the `radii` array in `MapView.tsx`:
```typescript
const radii = [5000, 50000, 150000]; // Add more radii in meters
```

#### Modifying LLM Prompts

Edit the system prompt in `app/api/map-recommendations/route.ts` to change how recommendations are generated.

## Edge Cases Handled

1. **Ocean/Water Clicks**
   - Detects water bodies by location name
   - Suggests coastal cities and beach destinations
   - Focuses on water-based activities

2. **Remote Areas**
   - Detects lack of nearby attractions
   - Emphasizes adventure and nature experiences
   - Suggests base camp towns

3. **API Failures**
   - Graceful fallback messages
   - Continues with partial data if available
   - User-friendly error messages

4. **No Attractions Found**
   - Expands search radius automatically
   - Falls back to nearby cities
   - Generates recommendations based on available data

## Future Enhancements

- Add OpenTripMap API key for higher rate limits
- Implement caching for frequently clicked locations
- Add filters for attraction types (museums, nature, etc.)
- Show travel routes between locations
- Add weather information for destinations
- Implement user favorites/bookmarks
- Add sharing functionality for discovered locations

## Performance Considerations

- Lazy loading of MapView component to avoid SSR issues with Leaflet
- Limits attraction markers to top 10 to avoid cluttering the map
- **20-second cooldown** between clicks to prevent rate limiting with free models
- Response caching could reduce API calls

## Rate Limiting

### Free Models
Free models on OpenRouter have strict rate limits:
- **~3 requests per minute**
- **~20 requests per hour**

The app implements a **20-second cooldown** between map clicks to help prevent hitting these limits.

### Solutions for Rate Limits

1. **Wait between clicks** (Current implementation)
   - 20-second cooldown enforced
   - User-friendly error messages

2. **Upgrade to paid model** (Recommended for production)
   - Edit `.env.local`: `OPENROUTER_MODEL=anthropic/claude-3-haiku`
   - Very affordable (~$0.25 per 1M tokens)
   - Much higher rate limits
   - Better quality responses

3. **Implement caching** (Future enhancement)
   - Cache responses for frequently clicked locations
   - Reduce API calls significantly

## Browser Compatibility

- Works in all modern browsers that support:
  - Leaflet.js
  - Fetch API
  - ES6+ JavaScript
- Mobile-responsive design
- Touch-friendly map controls

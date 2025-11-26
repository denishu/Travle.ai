// Core message type for conversation history
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Travel plan structure returned by the LLM
export interface TravelPlan {
  id: string;
  destination: string;
  country: string;
  duration: {
    startDate: string;
    endDate: string;
    nights: number;
    hours?: number; // Estimated hours needed for single-attraction visits
  };
  budget: {
    estimated: number;
    currency: string;
    breakdown: {
      // Day-trip focused fields
      admission?: number;
      activities?: number;
      food?: number;
      transportation?: number;
      // Legacy fields for backward compatibility
      flights?: number;
      accommodation?: number;
      other?: number;
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

// Complete recommendation response from LLM
export interface RecommendationResponse {
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

// API request/response types
export interface AssistantRequest {
  messages: Message[];
}

export interface AssistantResponse {
  message?: string;
  travelPlans?: TravelPlan[];
  summary?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  retryable: boolean;
}

// Component prop types
export interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export interface TravelCardProps {
  plan: TravelPlan;
  index: number;
}

export interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

// Application state type
export interface AppState {
  messages: Message[];
  travelPlans: TravelPlan[] | null;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

// Map-related types
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

export interface OpenTripMapPlace {
  xid: string;
  name: string;
  dist: number;
  rate: number;
  osm: string;
  wikidata?: string;
  kinds: string;
  point: {
    lon: number;
    lat: number;
  };
}

export interface MapRecommendationRequest {
  coordinates: LocationCoordinates;
  locationName: string;
  nearbyAttractions: OpenTripMapPlace[];
  nearbyCities: string[];
}

export interface MapRecommendationResponse {
  travelPlans: TravelPlan[];
  summary: string;
  error?: string;
}

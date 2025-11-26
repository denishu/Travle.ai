'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationCoordinates, OpenTripMapPlace, TravelPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import TravelCard from '@/components/TravelCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const clickedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  onBack: () => void;
}

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick: (coords: LocationCoordinates) => void }) {
  useMapEvents({
    click: (e) => {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView({ onBack }: MapViewProps) {
  const [clickedLocation, setClickedLocation] = useState<LocationCoordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [nearbyAttractions, setNearbyAttractions] = useState<OpenTripMapPlace[]>([]);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Handle map click with cooldown
  const handleMapClick = async (coords: LocationCoordinates) => {
    // Implement cooldown to prevent rate limiting (20 seconds between clicks)
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    const cooldownPeriod = 20000; // 20 seconds
    
    if (timeSinceLastClick < cooldownPeriod && lastClickTime > 0) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastClick) / 1000);
      setError(`⏱️ Please wait ${remainingTime} seconds before clicking another location to avoid rate limits.`);
      return;
    }
    
    setLastClickTime(now);
    setClickedLocation(coords);
    setIsLoading(true);
    setError(null);
    setTravelPlans(null);
    setSummary(null);
    setNearbyAttractions([]);

    try {
      // Step 1: Reverse geocoding with Nominatim
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=10`,
        {
          headers: {
            'User-Agent': 'Travle.ai Travel Advisor App'
          }
        }
      );

      if (!nominatimResponse.ok) {
        throw new Error('Failed to fetch location information');
      }

      const locationData = await nominatimResponse.json();
      const displayName = locationData.display_name || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      setLocationName(displayName);

      // Step 2: Fetch nearby attractions with OpenTripMap
      let attractions = await fetchNearbyAttractions(coords);
      
      // Fallback to Wikipedia if OpenTripMap has no data
      if (attractions.length === 0) {
        console.log('OpenTripMap has no data, trying Wikipedia...');
        attractions = await fetchWikipediaPlaces(coords);
      }
      
      setNearbyAttractions(attractions);
      
      // Log attractions for debugging
      console.log(`Found ${attractions.length} attractions near ${displayName}:`, 
        attractions.slice(0, 10).map(a => `${a.name} (${(a.dist / 1000).toFixed(1)}km)`)
      );

      // Step 3: Fetch nearby cities
      const cities = await fetchNearbyCities(coords);

      // Step 4: Get AI recommendations
      const recommendationsResponse = await fetch('/api/map-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: coords,
          locationName: displayName,
          nearbyAttractions: attractions,
          nearbyCities: cities,
        }),
      });

      if (!recommendationsResponse.ok) {
        const errorData = await recommendationsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate recommendations');
      }

      const recommendationsData = await recommendationsResponse.json();

      if (recommendationsData.error) {
        throw new Error(recommendationsData.error);
      }

      setTravelPlans(recommendationsData.travelPlans || []);
      setSummary(recommendationsData.summary || null);
      setIsPanelOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Provide helpful error messages based on error type
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.toLowerCase().includes('rate limit')) {
        userFriendlyMessage = '⏱️ Rate limit reached: Free models have limits. Please wait 30-60 seconds before clicking another location, or consider upgrading to a paid model for unlimited usage.';
      } else if (errorMessage.toLowerCase().includes('429')) {
        userFriendlyMessage = '⏱️ Too many requests: Please wait a moment before trying again.';
      }
      
      setError(userFriendlyMessage);
      console.error('Error processing map click:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nearby attractions from OpenTripMap
  const fetchNearbyAttractions = async (coords: LocationCoordinates): Promise<OpenTripMapPlace[]> => {
    const allAttractions: OpenTripMapPlace[] = [];

    // Multi-radius search strategy
    const radii = [5000, 50000]; // 5km and 50km in meters

    for (const radius of radii) {
      try {
        const response = await fetch(
          `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${coords.lng}&lat=${coords.lat}&kinds=interesting_places,tourist_facilities,cultural,natural&format=json&limit=20`
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            allAttractions.push(...data);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch attractions for radius ${radius}:`, err);
      }
    }

    // Remove duplicates and sort by distance and rating
    const uniqueAttractions = Array.from(
      new Map(allAttractions.map(item => [item.xid, item])).values()
    );

    return uniqueAttractions
      .filter(a => a.name && a.name.trim() !== '')
      .sort((a, b) => {
        // Sort by rate first (higher is better), then by distance (closer is better)
        if (b.rate !== a.rate) {
          return b.rate - a.rate;
        }
        return a.dist - b.dist;
      })
      .slice(0, 15); // Limit to top 15
  };

  // Fetch nearby cities using Nominatim search
  const fetchNearbyCities = async (coords: LocationCoordinates): Promise<string[]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=city&lat=${coords.lat}&lon=${coords.lng}&limit=5`,
        {
          headers: {
            'User-Agent': 'Travle.ai Travel Advisor App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.map((city: any) => city.display_name).filter((name: string) => name);
      }
    } catch (err) {
      console.warn('Failed to fetch nearby cities:', err);
    }

    return [];
  };

  // Fallback: Search Wikipedia for nearby places when OpenTripMap has no data
  const fetchWikipediaPlaces = async (coords: LocationCoordinates): Promise<OpenTripMapPlace[]> => {
    try {
      // Use Wikipedia geosearch API
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${coords.lat}|${coords.lng}&gsradius=10000&gslimit=30&format=json&origin=*`
      );

      if (response.ok) {
        const data = await response.json();
        const places = data.query?.geosearch || [];
        
        // Filter out obvious non-tourist places (be conservative to avoid false positives)
        const filteredPlaces = places.filter((place: any) => {
          const title = place.title.toLowerCase();
          
          // Exclude subway/metro stations (very specific patterns)
          if (title.includes('station')) {
            // Only exclude if it's clearly a transit station
            if (title.includes('subway') || title.includes('metro') || 
                title.match(/line \d+/) || title.includes('mrt') ||
                title.includes('underground station')) {
              return false;
            }
            // Keep historic stations, train stations that might be attractions
          }
          
          // Exclude highway interchanges and overpasses (not roads/streets in general)
          if (title.includes('interchange') || title.includes('overpass') || 
              title.includes('underpass') || title.includes('flyover')) {
            return false;
          }
          
          // Exclude pure administrative divisions (but keep if they have other context)
          if (title.match(/^.+ (district|subdistrict|county|province)$/)) {
            return false;
          }
          
          // Exclude generic infrastructure terminals
          if (title.includes('bus terminal') || title.includes('airport terminal')) {
            return false;
          }
          
          // Exclude parking lots and garages
          if (title.includes('parking') || title.includes('car park')) {
            return false;
          }
          
          return true;
        });
        
        // Convert Wikipedia results to OpenTripMapPlace format
        return filteredPlaces.map((place: any) => ({
          xid: `wiki-${place.pageid}`,
          name: place.title,
          dist: place.dist || 0,
          rate: 3, // Default rating for Wikipedia places
          osm: '',
          kinds: 'wikipedia',
          point: {
            lon: place.lon,
            lat: place.lat
          }
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch Wikipedia places:', err);
    }

    return [];
  };

  return (
    <div className="relative h-screen w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-sm border-b border-primary/20 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary">Map Mode</h1>
              <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                Click anywhere on the map to discover travel recommendations
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                ℹ️ Free models: Wait a couple minutes between clicks to avoid rate limits
              </p>
            </div>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all"
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm border border-primary/20 rounded-lg p-4 shadow-lg fade-in">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm font-medium">Discovering attractions! This may take a minute...</span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md w-full px-4 fade-in">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={handleMapClick} />
        
        {/* Clicked location marker */}
        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]} icon={clickedIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{locationName || 'Selected Location'}</p>
                <p className="text-xs text-foreground/70 mt-1">
                  {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby attractions markers */}
        {nearbyAttractions.slice(0, 10).map((attraction) => (
          <Marker
            key={attraction.xid}
            position={[attraction.point.lat, attraction.point.lon]}
            icon={icon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{attraction.name}</p>
                <p className="text-xs text-foreground/70 mt-1">
                  {(attraction.dist / 1000).toFixed(1)} km away
                </p>
                {attraction.rate > 0 && (
                  <p className="text-xs text-foreground/70">
                    Rating: {attraction.rate}/7
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating travel plans button */}
      {travelPlans && travelPlans.length > 0 && !isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-secondary to-primary text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-3 z-[1000] group"
        >
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-sm sm:text-base">View Recommendations</span>
          <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
            {travelPlans.length}
          </div>
        </button>
      )}

      {/* Floating travel plans panel */}
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] fade-in"
            onClick={() => setIsPanelOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] lg:w-[700px] bg-background border-l border-primary/20 shadow-2xl z-[1002] flex flex-col slide-in-right">
            {/* Panel header */}
            <div className="border-b border-secondary/20 p-4 sm:p-6 bg-gradient-to-r from-secondary/10 to-primary/10 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary">Travel Recommendations</h2>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                      {locationName}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsPanelOpen(false)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all"
                >
                  <span className="text-lg">✕</span>
                </Button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {travelPlans && travelPlans.length > 0 ? (
                <div className="space-y-4 sm:space-y-6 fade-in">
                  {/* Summary section */}
                  {summary && (
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📋</span>
                        <h3 className="font-bold text-base sm:text-lg text-accent-foreground">Summary</h3>
                      </div>
                      <p className="text-sm sm:text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {/* Travel plan cards */}
                  <div className="space-y-4 sm:space-y-6">
                    {travelPlans.map((plan, index) => (
                      <TravelCard key={plan.id || index} plan={plan} index={index} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

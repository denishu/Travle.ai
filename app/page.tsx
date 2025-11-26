'use client';

import { useState, lazy, Suspense } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import VoiceSynthesis from '@/components/VoiceSynthesis';
import ConversationDisplay from '@/components/ConversationDisplay';
import TravelCard from '@/components/TravelCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Message, TravelPlan, AssistantResponse } from '@/lib/types';

// Lazy load MapView to avoid SSR issues with Leaflet
const MapView = lazy(() => import('@/components/MapView'));

export default function Home() {
  // Initialize state
  const [messages, setMessages] = useState<Message[]>([]);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'map' | null>(null);
  const [currentSpeech, setCurrentSpeech] = useState<string | null>(null);

  // Retry mechanism with exponential backoff
  const callAssistantWithRetry = async (
    messages: Message[],
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<AssistantResponse> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Don't retry on client errors (400-499) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
          }

          // Retry on server errors (500+) and rate limits (429)
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data: AssistantResponse = await response.json();

        // Check for error in response
        if (data.error) {
          throw new Error(data.error);
        }

        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Failed after retries');
  };

  // Handle voice transcript from VoiceRecorder
  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;

    // Clear any previous errors
    setError(null);

    // Add user message to conversation history
    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    // Update messages state with new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Set loading state
    setIsLoading(true);

    try {
      // Call API with retry mechanism
      const data = await callAssistantWithRetry(updatedMessages);

      // Handle text response or travel plans
      if (data.message) {
        // Add assistant message to conversation history
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages([...updatedMessages, assistantMessage]);
        
        // Speak the AI response
        setCurrentSpeech(data.message);
      }

      // Update UI based on response type
      if (data.travelPlans && data.travelPlans.length > 0) {
        setTravelPlans(data.travelPlans);
        setSummary(data.summary || null);
        
        // Speak the summary if available
        if (data.summary) {
          setCurrentSpeech(data.summary);
        }
      }
    } catch (err) {
      // Enhanced error handling with user-friendly messages
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      let userFriendlyMessage = errorMessage;
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userFriendlyMessage = '🌐 Network error: Please check your internet connection and try again.';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        userFriendlyMessage = '⏱️ Too many requests: Please wait a moment before trying again.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage = '⏰ Request timed out: The server took too long to respond. Please try again.';
      } else if (errorMessage.includes('Invalid JSON') || errorMessage.includes('parse')) {
        userFriendlyMessage = '🔧 Response error: Received an invalid response. Please try again.';
      } else {
        userFriendlyMessage = `❌ ${errorMessage}`;
      }
      
      setError(userFriendlyMessage);
      console.error('Error calling assistant API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle errors from VoiceRecorder
  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle start button click
  const handleStart = () => {
    setHasStarted(true);
    setMode('voice');
  };

  // Handle map mode button click
  const handleMapMode = () => {
    setMode('map');
  };

  // Handle back button click - reset to greeting screen
  const handleBack = () => {
    setHasStarted(false);
    setMode(null);
    setMessages([]);
    setTravelPlans(null);
    setSummary(null);
    setError(null);
  };

  // Map mode
  if (mode === 'map') {
    return (
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-foreground/70">Loading map...</p>
          </div>
        </div>
      }>
        <MapView onBack={handleBack} />
      </Suspense>
    );
  }

  // Greeting screen with mode selection
  if (!hasStarted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 gradient-sky relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl w-full text-center space-y-6 sm:space-y-8 fade-in relative z-10">
          {/* Travel icon */}
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce">✈️</div>
          
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Travle.ai
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 px-4 font-medium">
              Travel advisor - tell me about your dream vacation, and I'll create personalized travel plans just for you
            </p>
          </div>

          {/* Two mode options side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
            {/* Voice Mode */}
            <div className="space-y-4 fade-in">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-5 sm:p-6 text-left space-y-3 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all h-full">
                <h2 className="font-bold text-base sm:text-lg text-primary flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Voice Mode
                </h2>
                <p className="text-sm sm:text-base text-foreground/70 mb-4">
                  Have a natural conversation about your travel preferences and get personalized recommendations
                </p>
                <ol className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary flex-shrink-0">1.</span>
                    <span>Tell me about your travel preferences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-secondary flex-shrink-0">2.</span>
                    <span>I'll ask questions to understand your needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-accent flex-shrink-0">3.</span>
                    <span>Get 2-3 personalized travel plans</span>
                  </li>
                </ol>
              </div>

              <div onClick={handleStart} className="transition-transform hover:scale-105">
                <VoiceRecorder
                  onTranscript={handleTranscript}
                  onError={handleVoiceError}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Map Mode */}
            <div className="space-y-4 fade-in">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-secondary/20 rounded-2xl p-5 sm:p-6 text-left space-y-3 shadow-lg hover:shadow-xl hover:border-secondary/40 transition-all h-full">
                <h2 className="font-bold text-base sm:text-lg text-secondary flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  Map Mode
                </h2>
                <p className="text-sm sm:text-base text-foreground/70 mb-4">
                  Explore the world visually - click anywhere on the map to discover attractions and activities nearby
                </p>
                <ol className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary flex-shrink-0">1.</span>
                    <span>Click any location on the interactive map</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-secondary flex-shrink-0">2.</span>
                    <span>Discover nearby attractions and cities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-accent flex-shrink-0">3.</span>
                    <span>Get curated recommendations for that area</span>
                  </li>
                </ol>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleMapMode}
                  size="lg"
                  className="min-w-[180px] sm:min-w-[200px] bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <span className="mr-2 text-xl">🌍</span>
                  <span className="text-sm sm:text-base">Explore Map</span>
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="fade-in mt-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    );
  }

  // Main conversation interface with floating travel plans panel
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative">
      {/* Full-screen conversation */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-primary/20 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💬</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Travle.ai</h1>
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                  Have a conversation about your travel plans
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  ℹ️ Free models: Wait a couple minutes between clicks to avoid rate limits
                </p>
              </div>
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <span className="text-lg">←</span>
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>

        {/* Conversation area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ConversationDisplay messages={messages} isLoading={isLoading} />
        </div>

        {/* Voice recorder footer */}
        <div className="border-t border-primary/20 p-4 sm:p-6 bg-card/80 backdrop-blur-sm space-y-3">
          {/* Voice synthesis indicator */}
          <VoiceSynthesis
            text={currentSpeech}
            autoPlay={true}
            onEnd={() => setCurrentSpeech(null)}
            onError={(error) => console.error('Voice synthesis error:', error)}
          />
          
          <VoiceRecorder
            onTranscript={handleTranscript}
            onError={handleVoiceError}
            disabled={isLoading}
          />

          {error && (
            <Alert variant="destructive" className="mt-4 fade-in">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm space-y-3">
                <p>{error}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setError(null)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                  {messages.length > 0 && (
                    <Button
                      onClick={() => {
                        const lastUserMessage = messages[messages.length - 1];
                        if (lastUserMessage.role === 'user') {
                          handleTranscript(lastUserMessage.content);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Retry Last Message
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Floating travel plans button - shows when there are travel plans */}
      {travelPlans && travelPlans.length > 0 && !isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-secondary to-primary text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-3 z-50 group"
        >
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-sm sm:text-base">Your Travel Plans</span>
          {/* Notification badge */}
          <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
            {travelPlans.length}
          </div>
        </button>
      )}

      {/* Floating travel plans panel (expanded) */}
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 fade-in"
            onClick={() => setIsPanelOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] lg:w-[700px] bg-background border-l border-primary/20 shadow-2xl z-50 flex flex-col slide-in-right">
            {/* Panel header */}
            <div className="border-b border-secondary/20 p-4 sm:p-6 bg-gradient-to-r from-secondary/10 to-primary/10 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary">Your Travel Plans</h2>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                      {travelPlans?.length || 0} personalized recommendation{travelPlans && travelPlans.length !== 1 ? 's' : ''}
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
    </main>
  );
}

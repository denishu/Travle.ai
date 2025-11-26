'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export interface VoiceSynthesisProps {
  text: string | null;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export default function VoiceSynthesis({
  text,
  autoPlay = true,
  onStart,
  onEnd,
  onError,
}: VoiceSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string | null>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      if (!window.speechSynthesis) {
        setIsSupported(false);
        onError?.('Text-to-speech is not supported in this browser.');
        return;
      }
    }
  }, [onError]);

  useEffect(() => {
    // Handle new text
    if (!text || !isSupported) return;

    // If text hasn't changed, don't restart
    if (text === currentTextRef.current) return;

    currentTextRef.current = text;

    // Stop any currently playing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (autoPlay) {
      speak(text);
    }

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, autoPlay, isSupported]);

  const speak = (textToSpeak: string) => {
    if (!isSupported || !textToSpeak.trim()) return;

    try {
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Configure voice settings
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume

      // Try to select a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        voice => voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(
        voice => voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Handle events
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        
        let errorMessage = 'An error occurred with text-to-speech.';
        if (event.error === 'interrupted') {
          // Not really an error, just interrupted by new speech
          return;
        } else if (event.error === 'canceled') {
          // User cancelled, not an error
          return;
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Text-to-speech permission denied.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error occurred during speech synthesis.';
        }
        
        onError?.(errorMessage);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      onError?.('Failed to start text-to-speech. Please try again.');
    }
  };

  const stop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.speaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  // Don't render anything if not supported (graceful fallback)
  if (!isSupported) {
    return null;
  }

  // Only show controls if currently speaking
  if (!isSpeaking) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg animate-pulse">🔊</span>
        <span className="text-xs sm:text-sm text-foreground/80 font-medium">
          {isPaused ? 'Speech paused' : 'Speaking...'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {isPaused ? (
          <Button
            onClick={resume}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs hover:bg-primary/20"
          >
            ▶️ Resume
          </Button>
        ) : (
          <Button
            onClick={pause}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs hover:bg-primary/20"
          >
            ⏸️ Pause
          </Button>
        )}
        
        <Button
          onClick={stop}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs hover:bg-destructive/20"
        >
          ⏹️ Stop
        </Button>
      </div>
    </div>
  );
}

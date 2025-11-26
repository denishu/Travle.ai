'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VoiceRecorderProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function VoiceRecorder({ onTranscript, onError, disabled = false }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      // Initialize Web Speech API
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening until manually stopped
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Handle speech recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInterimTranscript('');
          onTranscript(final);
          setIsListening(false);
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Aborted is not an error - it happens when user stops recording or component unmounts
        if (event.error === 'aborted') {
          setIsListening(false);
          setInterimTranscript('');
          return;
        }

        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');

        let errorMessage = 'An error occurred with speech recognition.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
        }

        onError(errorMessage);
      };

      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError]);

  const startRecording = () => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      onError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Browser Not Supported</AlertTitle>
        <AlertDescription>
          Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <Button
        onClick={isListening ? stopRecording : startRecording}
        disabled={disabled}
        variant={isListening ? 'destructive' : 'default'}
        size="lg"
        className={cn(
          "min-w-[180px] sm:min-w-[200px] transition-all duration-300 hover:scale-110 disabled:hover:scale-100 font-bold text-base shadow-lg hover:shadow-xl",
          !isListening && "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        )}
      >
        {isListening ? (
          <>
            <span className="animate-pulse mr-2 text-xl">🎤</span>
            <span className="text-sm sm:text-base">Stop Recording</span>
          </>
        ) : (
          <>
            <span className="mr-2 text-xl">🎤</span>
            <span className="text-sm sm:text-base">Start Talking</span>
          </>
        )}
      </Button>

      {interimTranscript && (
        <div className="text-xs sm:text-sm text-foreground italic max-w-md text-center px-4 fade-in bg-primary/10 border border-primary/30 rounded-xl py-3 shadow-sm">
          <span className="font-semibold text-primary">Listening: </span>
          {interimTranscript}
        </div>
      )}
    </div>
  );
}

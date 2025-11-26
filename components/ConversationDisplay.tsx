'use client';

import React, { useEffect, useRef } from 'react';
import { ConversationDisplayProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ConversationDisplay({ messages, isLoading }: ConversationDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle empty conversation state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Start a conversation to see messages here</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col space-y-4 overflow-y-auto h-full p-4 md:p-6 scroll-smooth custom-scrollbar"
    >
      {messages.map((message, index) => {
        // Skip system messages in the display
        if (message.role === 'system') {
          return null;
        }

        const isUser = message.role === 'user';
        
        return (
          <div
            key={`${message.timestamp}-${index}`}
            className={cn(
              'flex flex-col fade-in',
              isUser ? 'items-end slide-in-right' : 'items-start slide-in-left'
            )}
          >
            {/* Message bubble */}
            <div
              className={cn(
                'max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg',
                isUser 
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm border border-primary/20' 
                  : 'bg-card text-foreground rounded-bl-sm border-2 border-secondary/30'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
            
            {/* Timestamp */}
            <span className="text-xs text-muted-foreground mt-1 px-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-start fade-in">
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Invisible element for auto-scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
}

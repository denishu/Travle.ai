'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * 
 * Requirements: 11.2
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive" className="fade-in">
              <AlertTitle className="text-lg font-bold">Something went wrong</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>We encountered an unexpected error. This has been logged and we'll look into it.</p>
                {this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error details
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-black/10 rounded">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1"
                variant="default"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1"
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

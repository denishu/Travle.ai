import { Message } from './types';

/**
 * OpenRouter API client for LLM interactions
 * Handles authentication, request formatting, and error handling
 */

// Configuration interface for chat options
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

// Response structure from OpenRouter API
export interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// OpenRouter API error structure
interface OpenRouterError {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
  message?: string;
}

// Default configuration
// Using a reliable, low-cost model that's consistently available
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1500;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * OpenRouter API client class
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = OPENROUTER_API_URL;

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable.');
    }
  }

  /**
   * Send a chat request to OpenRouter API
   * @param messages - Array of conversation messages
   * @param options - Optional configuration for the request
   * @returns ChatResponse with content and usage information
   */
  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const {
      model = DEFAULT_MODEL,
      temperature = DEFAULT_TEMPERATURE,
      maxTokens = DEFAULT_MAX_TOKENS,
      responseFormat = 'text'
    } = options;

    // Format messages for OpenRouter API (remove timestamp field)
    const formattedMessages = messages.map(({ role, content }) => ({
      role,
      content
    }));

    // Construct request body
    const requestBody = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat === 'json' && { response_format: { type: 'json_object' } })
    };

    // Log request for debugging
    this.logRequest(model, formattedMessages.length, maxTokens);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Voice Travel Advisor'
        },
        body: JSON.stringify(requestBody)
      });

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();

      // Extract content and usage from response
      const content = data.choices?.[0]?.message?.content || '';
      const usage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      };

      // Log response for debugging
      this.logResponse(usage);

      return {
        content,
        usage
      };

    } catch (error) {
      // Handle network and other errors
      this.logError(error);
      throw this.formatError(error);
    }
  }

  /**
   * Handle error responses from OpenRouter API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: OpenRouterError;
    
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, create a generic error
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
    const errorType = errorData.error?.type || 'api_error';
    const errorCode = errorData.error?.code || response.status.toString();

    // Handle specific error types
    switch (response.status) {
      case 401:
        throw new Error('Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY environment variable.');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later.');
      case 400:
        throw new Error(`Bad request: ${errorMessage}`);
      case 500:
      case 502:
      case 503:
        throw new Error(`OpenRouter service error: ${errorMessage}. Please try again.`);
      default:
        throw new Error(`OpenRouter API error (${errorCode}): ${errorMessage}`);
    }
  }

  /**
   * Format errors into a consistent structure
   */
  private formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error('An unexpected error occurred while calling OpenRouter API');
  }

  /**
   * Log request details for debugging
   */
  private logRequest(model: string, messageCount: number, maxTokens: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OpenRouter] Request:', {
        model,
        messageCount,
        maxTokens,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log response details for debugging
   */
  private logResponse(usage: ChatResponse['usage']): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OpenRouter] Response:', {
        usage,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log errors for debugging
   */
  private logError(error: unknown): void {
    console.error('[OpenRouter] Error:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Create a singleton instance of the OpenRouter client
 * This can be imported and used throughout the application
 */
export const openRouterClient = new OpenRouterClient();

/**
 * Helper function to create a new OpenRouter client with a custom API key
 * Useful for testing or when multiple API keys are needed
 */
export function createOpenRouterClient(apiKey: string): OpenRouterClient {
  return new OpenRouterClient(apiKey);
}

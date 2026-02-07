/**
 * Enhanced error handling and recovery utilities
 */

import { AppError } from '@/lib/types';

class AppErrorClass extends Error implements AppError {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Creates a standardized app error
 */
export function createError(
  message: string,
  code: string = 'UNKNOWN_ERROR',
  status: number = 500,
  details?: Record<string, unknown>
): AppError {
  return new AppErrorClass(message, code, status, details);
}

/**
 * Handles API errors and provides user-friendly messages
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppErrorClass) {
    return error;
  }

  if (error instanceof Error) {
    // Network error
    if (error.message === 'Failed to fetch' || error.message.includes('network')) {
      return createError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    // Timeout error
    if (error.message.includes('timeout')) {
      return createError(
        'Request timed out. Please try again.',
        'TIMEOUT_ERROR',
        408
      );
    }

    return createError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }

  return createError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
}

/**
 * Retries a promise with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts - 1) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Validates if a value is not null or undefined
 */
export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T = unknown>(json: string, defaultValue: T | null = null): T | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(value: unknown, defaultValue: string = ''): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('JSON stringify error:', error);
    return defaultValue;
  }
}

/**
 * Validates error response structure
 */
export function isErrorResponse(response: unknown): response is { error: string; status?: number } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as Record<string, unknown>).error === 'string'
  );
}

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppErrorClass) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (isErrorResponse(error)) {
    return error.error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof AppErrorClass)) return false;

  // Retryable status codes: timeout, too many requests, service unavailable, bad gateway
  const retryableStatuses = [408, 429, 503, 502, 504];
  return retryableStatuses.includes(error.status || 0);
}

/**
 * Creates a timeout promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(createError(
          'Request timeout',
          'TIMEOUT_ERROR',
          408
        )),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Result pattern for type-safe error handling
 * Provides a consistent way to handle success and failure cases without exceptions
 */

/**
 * Error details structure for failed operations
 */
export interface ErrorDetails {
  /** Error code for categorization */
  code: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code if applicable */
  status?: number;
  /** Field-specific validation errors */
  fieldErrors?: Record<string, string>;
  /** Additional error metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Success result containing data
 */
export interface Success<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Failure result containing error details
 */
export interface Failure {
  success: false;
  error: ErrorDetails;
}

/**
 * Result type - either Success or Failure
 */
export type Result<T> = Success<T> | Failure;

/**
 * Creates a success result
 * @param data - The successful operation data
 * @param message - Optional success message
 * @returns Success result
 */
export function success<T>(data: T, message?: string): Success<T> {
  return { success: true, data, message };
}

/**
 * Creates a failure result
 * @param error - Error details
 * @returns Failure result
 */
export function failure(error: ErrorDetails): Failure {
  return { success: false, error };
}

/**
 * Converts an unknown error to ErrorDetails
 * @param error - The error to convert
 * @param defaultCode - Default error code if not determinable
 * @returns Structured error details
 */
export function errorToDetails(
  error: unknown,
  defaultCode: string = 'UNKNOWN_ERROR'
): ErrorDetails {
  // Handle ErrorDetails objects
  if (isErrorDetails(error)) {
    return error;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: defaultCode,
      message: error.message,
      metadata: {
        name: error.name,
        stack: error.stack,
      },
    };
  }

  // Handle HTTP errors (common structure)
  if (isHttpError(error)) {
    return {
      code: error.code || defaultCode,
      message: error.message || 'HTTP request failed',
      status: error.status || error.statusCode,
      fieldErrors: error.fieldErrors || error.errors,
      metadata: error.data || error.response?.data,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: defaultCode,
      message: error,
    };
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      code: defaultCode,
      message: String((error as { message: unknown }).message),
      metadata: error as Record<string, unknown>,
    };
  }

  // Fallback for unknown error types
  return {
    code: defaultCode,
    message: 'An unknown error occurred',
    metadata: {
      originalError: error,
    },
  };
}

/**
 * Type guard for ErrorDetails
 */
function isErrorDetails(error: unknown): error is ErrorDetails {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ErrorDetails).code === 'string' &&
    typeof (error as ErrorDetails).message === 'string'
  );
}

/**
 * Type guard for HTTP errors (common structure from axios, fetch, etc.)
 */
function isHttpError(error: unknown): error is {
  code?: string;
  message?: string;
  status?: number;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  errors?: Record<string, string>;
  data?: unknown;
  response?: { data?: unknown };
} {
  return (
    typeof error === 'object' && error !== null && ('status' in error || 'statusCode' in error)
  );
}

/**
 * Checks if a result is successful
 * @param result - The result to check
 * @returns True if the result is successful
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success === true;
}

/**
 * Checks if a result is a failure
 * @param result - The result to check
 * @returns True if the result is a failure
 */
export function isFailure<T>(result: Result<T>): result is Failure {
  return result.success === false;
}

/**
 * Maps a successful result to a new value
 * @param result - The result to map
 * @param fn - Mapping function
 * @returns New result with mapped value or original failure
 */
export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isSuccess(result)) {
    return success(fn(result.data), result.message);
  }
  return result;
}

/**
 * FlatMaps a successful result (prevents nesting)
 * @param result - The result to flatMap
 * @param fn - Mapping function that returns a Result
 * @returns Flattened result
 */
export function flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
}

/**
 * Unwraps a result, throwing if it's a failure
 * @param result - The result to unwrap
 * @returns The data if successful
 * @throws Error if the result is a failure
 */
export function unwrap<T>(result: Result<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Unwraps a result or returns a default value
 * @param result - The result to unwrap
 * @param defaultValue - Value to return if result is failure
 * @returns The data if successful, or default value
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}

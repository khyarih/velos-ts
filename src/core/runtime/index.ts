/**
 * Core Runtime Module
 * Exports all runtime dependencies required by generated repositories
 */

// Result pattern exports
export type { Result, Success, Failure, ErrorDetails } from './result';

export {
  success,
  failure,
  errorToDetails,
  isSuccess,
  isFailure,
  map,
  flatMap,
  unwrap,
  unwrapOr,
} from './result';

// API Client exports
export type {
  ApiClient,
  RequestOptions,
  Headers,
  ApiClientConfig,
  RequestConfig,
} from './api-client';

export { FetchApiClient } from './api-client';

// Base Repository exports
export { BaseRepository } from './base-repository';

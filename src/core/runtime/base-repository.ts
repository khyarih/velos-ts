/**
 * Base Repository class
 * All generated repositories extend this class
 */

import type { ApiClient, RequestOptions } from './api-client';
import type { Result } from './result';
import { success, failure, errorToDetails } from './result';

/**
 * Abstract base repository class
 * Provides common functionality for all repositories
 * @template T - The primary entity type for this repository
 */
export abstract class BaseRepository<T = unknown> {
  /**
   * The base endpoint path for this repository
   * Must be defined by concrete repository implementations
   * @example '/api/v1/products'
   */
  protected abstract readonly endpoint: string;

  /**
   * Creates a new repository instance
   * @param apiClient - The HTTP client for making API requests
   */
  constructor(protected readonly apiClient: ApiClient) {}

  /**
   * Helper method to execute an API call with Result pattern
   * Wraps the API call in try-catch and returns Result<T>
   * @param fn - The API call function to execute
   * @param errorCode - Error code to use if the call fails
   * @returns Promise resolving to Result<T>
   */
  protected async execute<TResult>(
    fn: () => Promise<TResult>,
    errorCode: string = 'API_ERROR'
  ): Promise<Result<TResult>> {
    try {
      const data = await fn();
      return success(data);
    } catch (error) {
      return failure(errorToDetails(error, errorCode));
    }
  }

  /**
   * Helper method to build full URL path
   * @param segments - Path segments to append to base endpoint
   * @returns Full path
   * @example buildPath('123', 'details') => '/api/v1/products/123/details'
   */
  protected buildPath(...segments: (string | number)[]): string {
    const pathSegments = segments
      .filter((segment) => segment !== undefined && segment !== null)
      .map((segment) => String(segment).replace(/^\/|\/$/g, ''));

    return [this.endpoint, ...pathSegments].filter(Boolean).join('/').replace(/\/+/g, '/');
  }

  /**
   * Helper method to clean query parameters
   * Removes undefined and null values
   * @param params - Query parameters object
   * @returns Cleaned parameters
   */
  protected cleanParams<P extends Record<string, unknown>>(
    params?: P
  ): Record<string, unknown> | undefined {
    if (!params) return undefined;

    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  /**
   * Common method for GET requests returning a single entity
   * Can be used by generated repositories for standard patterns
   * @param id - Entity identifier
   * @param options - Request options
   * @returns Promise resolving to Result<T>
   */
  protected async getById(id: string | number, options?: RequestOptions): Promise<Result<T>> {
    return this.execute(async () => {
      const path = this.buildPath(id);
      return await this.apiClient.get<T>(path, undefined, {}, options);
    }, 'GET_BY_ID_ERROR');
  }

  /**
   * Common method for GET requests returning a list of entities
   * Can be used by generated repositories for standard patterns
   * @param params - Query parameters
   * @param options - Request options
   * @returns Promise resolving to Result<T[]>
   */
  protected async getAll(
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<Result<T[]>> {
    return this.execute(async () => {
      const cleanedParams = this.cleanParams(params);
      return await this.apiClient.get<T[]>(this.endpoint, cleanedParams, {}, options);
    }, 'GET_ALL_ERROR');
  }

  /**
   * Common method for POST requests creating a new entity
   * Can be used by generated repositories for standard patterns
   * @param data - Entity data to create
   * @param options - Request options
   * @returns Promise resolving to Result<T>
   */
  protected async create<TCreate = Partial<T>>(
    data: TCreate,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.execute(async () => {
      return await this.apiClient.post<T>(this.endpoint, data, {}, options);
    }, 'CREATE_ERROR');
  }

  /**
   * Common method for PUT requests updating an entity
   * Can be used by generated repositories for standard patterns
   * @param id - Entity identifier
   * @param data - Updated entity data
   * @param options - Request options
   * @returns Promise resolving to Result<T>
   */
  protected async update<TUpdate = Partial<T>>(
    id: string | number,
    data: TUpdate,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.execute(async () => {
      const path = this.buildPath(id);
      return await this.apiClient.put<T>(path, data, {}, options);
    }, 'UPDATE_ERROR');
  }

  /**
   * Common method for PATCH requests partially updating an entity
   * Can be used by generated repositories for standard patterns
   * @param id - Entity identifier
   * @param data - Partial entity data to update
   * @param options - Request options
   * @returns Promise resolving to Result<T>
   */
  protected async patch<TPatch = Partial<T>>(
    id: string | number,
    data: TPatch,
    options?: RequestOptions
  ): Promise<Result<T>> {
    return this.execute(async () => {
      const path = this.buildPath(id);
      return await this.apiClient.patch<T>(path, data, {}, options);
    }, 'PATCH_ERROR');
  }

  /**
   * Common method for DELETE requests removing an entity
   * Can be used by generated repositories for standard patterns
   * @param id - Entity identifier
   * @param options - Request options
   * @returns Promise resolving to Result<void>
   */
  protected async remove(id: string | number, options?: RequestOptions): Promise<Result<void>> {
    return this.execute(async () => {
      const path = this.buildPath(id);
      return await this.apiClient.delete<void>(path, undefined, {}, options);
    }, 'DELETE_ERROR');
  }

  /**
   * Get the base endpoint for this repository
   * Useful for debugging or custom operations
   */
  public getEndpoint(): string {
    return this.endpoint;
  }
}

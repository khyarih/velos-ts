/**
 * API Client interface and types
 * Defines the contract for HTTP client implementations
 */

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** Whether the request requires authentication */
  requiresAuth?: boolean;
  /** Custom headers for the request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials (cookies) */
  withCredentials?: boolean;
  /** Signal for request cancellation */
  signal?: AbortSignal;
  /** Custom request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * HTTP headers type
 */
export type Headers = Record<string, string>;

/**
 * API Client interface
 * Implement this interface to provide HTTP communication for repositories
 */
export interface ApiClient {
  /**
   * Perform a GET request
   * @param path - The API endpoint path
   * @param params - Query parameters
   * @param headers - Request headers
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  get<T>(
    path: string,
    params?: Record<string, unknown>,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T>;

  /**
   * Perform a POST request
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param headers - Request headers
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  post<T>(path: string, data?: unknown, headers?: Headers, options?: RequestOptions): Promise<T>;

  /**
   * Perform a PUT request
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param headers - Request headers
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  put<T>(path: string, data?: unknown, headers?: Headers, options?: RequestOptions): Promise<T>;

  /**
   * Perform a PATCH request
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param headers - Request headers
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  patch<T>(path: string, data?: unknown, headers?: Headers, options?: RequestOptions): Promise<T>;

  /**
   * Perform a DELETE request
   * @param path - The API endpoint path
   * @param data - Optional request body data
   * @param headers - Request headers
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  delete<T>(path: string, data?: unknown, headers?: Headers, options?: RequestOptions): Promise<T>;
}

/**
 * Base API Client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Default timeout for requests */
  timeout?: number;
  /** Default headers for all requests */
  defaultHeaders?: Headers;
  /** Authentication token or function to retrieve it */
  auth?: string | (() => string | Promise<string>);
  /** Interceptors for request/response */
  interceptors?: {
    request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    response?: <T>(response: T) => T | Promise<T>;
    error?: (error: unknown) => unknown | Promise<unknown>;
  };
}

/**
 * Request configuration
 */
export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Headers;
  data?: unknown;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

/**
 * Example implementation using fetch (provided as reference)
 * Users can implement their own ApiClient or use this as a starting point
 */
export class FetchApiClient implements ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  async get<T>(
    path: string,
    params?: Record<string, unknown>,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('GET', path, undefined, params, headers, options);
  }

  async post<T>(
    path: string,
    data?: unknown,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('POST', path, data, undefined, headers, options);
  }

  async put<T>(
    path: string,
    data?: unknown,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('PUT', path, data, undefined, headers, options);
  }

  async patch<T>(
    path: string,
    data?: unknown,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('PATCH', path, data, undefined, headers, options);
  }

  async delete<T>(
    path: string,
    data?: unknown,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('DELETE', path, data, undefined, headers, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: unknown,
    params?: Record<string, unknown>,
    headers?: Headers,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(path, params);
    const requestHeaders = await this.buildHeaders(headers, options);

    const requestConfig: RequestConfig = {
      url,
      method,
      headers: requestHeaders,
      data,
      params,
      timeout: options?.timeout ?? this.config.timeout,
      withCredentials: options?.withCredentials,
      signal: options?.signal,
    };

    // Apply request interceptor if configured
    const finalConfig = this.config.interceptors?.request
      ? await this.config.interceptors.request(requestConfig)
      : requestConfig;

    try {
      const controller = new AbortController();
      const timeoutId = finalConfig.timeout
        ? setTimeout(() => controller.abort(), finalConfig.timeout)
        : undefined;

      const response = await fetch(finalConfig.url, {
        method: finalConfig.method,
        headers: finalConfig.headers,
        body: finalConfig.data ? JSON.stringify(finalConfig.data) : undefined,
        credentials: finalConfig.withCredentials ? 'include' : 'same-origin',
        signal: finalConfig.signal ?? controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorDataObj =
          typeof errorData === 'object' && errorData !== null
            ? (errorData as Record<string, unknown>)
            : {};
        throw {
          status: response.status,
          statusCode: response.status,
          message: (typeof errorDataObj.message === 'string'
            ? errorDataObj.message
            : response.statusText),
          data: errorDataObj,
        };
      }

      const responseData = await response.json();

      // Apply response interceptor if configured
      return this.config.interceptors?.response
        ? await this.config.interceptors.response<T>(responseData as T)
        : (responseData as T);
    } catch (error) {
      // Apply error interceptor if configured
      if (this.config.interceptors?.error) {
        throw await this.config.interceptors.error(error);
      }
      throw error;
    }
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${baseUrl}${normalizedPath}`;

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async buildHeaders(headers?: Headers, options?: RequestOptions): Promise<Headers> {
    const mergedHeaders: Headers = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...headers,
      ...options?.headers,
    };

    // Add authentication if required
    if (options?.requiresAuth !== false && this.config.auth) {
      const token =
        typeof this.config.auth === 'function' ? await this.config.auth() : this.config.auth;
      mergedHeaders['Authorization'] = `Bearer ${token}`;
    }

    return mergedHeaders;
  }
}

/**
 * Example: Server-Side Cookie Authentication
 *
 * This example demonstrates how to use velos-ts generated repositories
 * with server-side HTTP-only cookie authentication.
 *
 * Use Case:
 * - Backend sets HTTP-only cookies (secure, can't be accessed by JavaScript)
 * - Frontend sends cookies automatically with each request
 * - CSRF token protection for state-changing operations
 *
 * Security Benefits:
 * - HTTP-only cookies prevent XSS attacks
 * - CSRF tokens prevent cross-site request forgery
 * - Credentials sent automatically - no manual token management
 */

//@ts-nocheck


import { FetchApiClient, type ApiClientConfig } from 'velos-ts/runtime';
import type { RequestConfig } from 'velos-ts/runtime';

// ==============================================================================
// Example 1: Basic Server-Side Cookie Authentication
// ==============================================================================

/**
 * Simple configuration for cookie-based authentication
 * The backend sets cookies, and they're sent automatically
 */
const basicApiClient = new FetchApiClient({
  baseUrl: 'https://api.example.com',

  // No auth token needed - cookies are sent automatically
  // The server sets cookies like:
  // Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict

  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Usage with repositories
import { OrderRepository, UserRepository } from '../src/generated/repositories';

const orderRepo = new OrderRepository(basicApiClient);
const userRepo = new UserRepository(basicApiClient);

// Example: Login request (server sets cookies in response)
async function login(email: string, password: string) {
  const result = await userRepo.login(
    { email, password },
    {
      withCredentials: true  // IMPORTANT: Required for cookies
    }
  );

  if (result.success) {
    console.log('✅ Logged in successfully');
    // Server has set HTTP-only cookies:
    // - session_id
    // - csrf_token (optional)
    // - refresh_token (optional)
  } else {
    console.error('❌ Login failed:', result.error);
  }

  return result;
}

// Example: Authenticated request (cookies sent automatically)
async function getOrders() {
  const result = await orderRepo.getAllOrders(
    undefined,
    {
      withCredentials: true  // Cookies sent with request
    }
  );

  if (result.success) {
    console.log('📦 Orders:', result.data);
  } else {
    console.error('❌ Failed to fetch orders:', result.error);
  }

  return result;
}

// Example: Create order (requires authentication)
async function createOrder(orderData: any) {
  const result = await orderRepo.createOrder(
    orderData,
    {
      withCredentials: true  // Cookies sent automatically
    }
  );

  if (result.success) {
    console.log('✅ Order created:', result.data);
  } else {
    console.error('❌ Failed to create order:', result.error);
  }

  return result;
}

// ==============================================================================
// Example 2: Cookie Authentication with CSRF Protection
// ==============================================================================

/**
 * Helper function to get CSRF token from cookie or meta tag
 */
function getCsrfToken(): string | null {
  // Option 1: Read from cookie (if server sets CSRF token as readable cookie)
  const cookieMatch = document.cookie.match(/csrf_token=([^;]+)/);
  if (cookieMatch) {
    return cookieMatch[1];
  }

  // Option 2: Read from meta tag (common in server-rendered apps)
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.content;
  }

  // Option 3: Read from localStorage (if your backend provides it)
  return localStorage.getItem('csrf_token');
}

/**
 * Enhanced API client with CSRF protection
 */
const csrfApiClient = new FetchApiClient({
  baseUrl: 'https://api.example.com',

  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  interceptors: {
    /**
     * Request interceptor: Add CSRF token to state-changing requests
     */
    request: async (config: RequestConfig): Promise<RequestConfig> => {
      // Only add CSRF token for state-changing methods
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
        const csrfToken = getCsrfToken();

        if (csrfToken) {
          config.headers = {
            ...config.headers,
            'X-CSRF-Token': csrfToken,
            // Alternative header names used by different backends:
            // 'X-XSRF-TOKEN': csrfToken,  // Used by Angular/Spring
            // 'CSRF-Token': csrfToken,     // Generic
          };
        } else {
          console.warn('⚠️ CSRF token not found for', config.method, 'request');
        }
      }

      return config;
    },

    /**
     * Response interceptor: Handle specific response patterns
     */
    response: async <T>(response: T): Promise<T> => {
      // You can transform responses here if needed
      return response;
    },

    /**
     * Error interceptor: Handle authentication errors
     */
    error: async (error: any): Promise<never> => {
      const status = error?.status || error?.statusCode;

      // Handle 401 Unauthorized - session expired
      if (status === 401) {
        console.error('🔒 Session expired or not authenticated');

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }

      // Handle 403 Forbidden - CSRF token invalid/missing
      if (status === 403) {
        const message = error?.message || '';
        if (message.toLowerCase().includes('csrf')) {
          console.error('🛡️ CSRF token validation failed');
          // You might want to refresh CSRF token and retry
        }
      }

      // Re-throw the error to be handled by the repository's Result pattern
      throw error;
    },
  },
});

// ==============================================================================
// Example 3: Complete Authentication Flow
// ==============================================================================

/**
 * Authentication service wrapper
 */
class AuthService {
  private userRepo: UserRepository;

  constructor(apiClient: FetchApiClient) {
    this.userRepo = new UserRepository(apiClient);
  }

  /**
   * Login user - server sets HTTP-only cookies
   */
  async login(email: string, password: string) {
    const result = await this.userRepo.login(
      { email, password },
      { withCredentials: true }
    );

    if (result.success) {
      console.log('✅ Login successful');
      // Server has set cookies:
      // - session_id (HTTP-only)
      // - csrf_token (readable, for CSRF protection)

      // Optionally store user info in localStorage (non-sensitive data only)
      if (result.data?.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
    }

    return result;
  }

  /**
   * Logout user - server clears cookies
   */
  async logout() {
    const result = await this.userRepo.logout(
      undefined,
      { withCredentials: true }
    );

    if (result.success) {
      console.log('✅ Logout successful');
      // Clear client-side data
      localStorage.removeItem('user');
    }

    return result;
  }

  /**
   * Check if user is authenticated (ping server)
   */
  async checkAuth() {
    const result = await this.userRepo.getCurrentUser(
      { withCredentials: true }
    );

    return result.success;
  }

  /**
   * Get current user from localStorage (cached)
   */
  getCachedUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// ==============================================================================
// Example 4: React Hook Integration
// ==============================================================================

/**
 * Example React hook for cookie-based authentication
 * (TypeScript + React)
 */

// Uncomment if using React:
/*
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = new AuthService(csrfApiClient);

  const isAuthenticated = user !== null;

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    const isAuth = await authService.checkAuth();

    if (isAuth) {
      const cachedUser = authService.getCachedUser();
      setUser(cachedUser);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);

    if (result.success && result.data?.user) {
      setUser(result.data.user);
      return true;
    }

    return false;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in components:
function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Redirect to dashboard
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
}

function ProtectedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome, {user?.name}!</div>;
}
*/

// ==============================================================================
// Example 5: Repository Usage with Default Options
// ==============================================================================

/**
 * Create a wrapper to avoid passing withCredentials every time
 */
class CookieOrderRepository extends OrderRepository {
  async getAllOrders(queryParams?: any, options?: any) {
    return super.getAllOrders(queryParams, {
      ...options,
      withCredentials: true,  // Always include credentials
    });
  }

  async createOrder(data: any, options?: any) {
    return super.createOrder(data, {
      ...options,
      withCredentials: true,
    });
  }

  // ... override other methods similarly
}

// Now you can use it without passing withCredentials every time
const cookieOrderRepo = new CookieOrderRepository(csrfApiClient);

async function example() {
  // No need to pass withCredentials - it's automatic now
  const result = await cookieOrderRepo.getAllOrders();

  if (result.success) {
    console.log('Orders:', result.data);
  }
}

// ==============================================================================
// Example 6: Backend Requirements
// ==============================================================================

/**
 * Your backend needs to:
 *
 * 1. Set HTTP-only cookies on login:
 *    ```
 *    Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
 *    ```
 *
 * 2. Optionally set CSRF token (readable cookie or response header):
 *    ```
 *    Set-Cookie: csrf_token=xyz789; Secure; SameSite=Strict; Path=/
 *    ```
 *
 * 3. Enable CORS with credentials:
 *    ```java
 *    // Spring Boot example:
 *    @Configuration
 *    public class WebConfig implements WebMvcConfigurer {
 *        @Override
 *        public void addCorsMappings(CorsRegistry registry) {
 *            registry.addMapping("/api/**")
 *                .allowedOrigins("http://localhost:3000")
 *                .allowCredentials(true)  // REQUIRED for cookies
 *                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
 *                .allowedHeaders("*");
 *        }
 *    }
 *    ```
 *
 * 4. Validate CSRF token on state-changing requests:
 *    ```java
 *    // Spring Security CSRF configuration
 *    @Bean
 *    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
 *        http
 *            .csrf()
 *                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
 *            .and()
 *            // ... other config
 *        return http.build();
 *    }
 *    ```
 *
 * 5. Return appropriate status codes:
 *    - 401 Unauthorized: Session expired or not authenticated
 *    - 403 Forbidden: CSRF token invalid or missing
 *    - 200/201: Success
 */

// ==============================================================================
// Summary
// ==============================================================================

/**
 * Key Points:
 *
 * 1. ✅ Always pass `withCredentials: true` in request options
 * 2. ✅ Use interceptors to add CSRF tokens automatically
 * 3. ✅ Handle 401/403 errors for session management
 * 4. ✅ Backend must enable CORS with credentials
 * 5. ✅ HTTP-only cookies are secure and can't be stolen via XSS
 * 6. ✅ CSRF tokens protect against cross-site request forgery
 *
 * Security Checklist:
 * - [ ] Cookies are HTTP-only (prevent XSS)
 * - [ ] Cookies have Secure flag (HTTPS only)
 * - [ ] Cookies have SameSite=Strict or Lax (prevent CSRF)
 * - [ ] CSRF tokens for state-changing operations
 * - [ ] CORS properly configured with allowCredentials
 * - [ ] Session timeout and refresh mechanism
 */

export {
  basicApiClient,
  csrfApiClient,
  AuthService,
  login,
  getOrders,
  createOrder,
  getCsrfToken,
};

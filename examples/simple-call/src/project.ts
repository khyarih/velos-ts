/**
 * Example: Server-Side Cookie Authentication
 *
 * This example demonstrates how to use velos-ts generated repositories
* It showcases a complete authentication flow using server-side cookies.
 *
 * Note: This is a simplified example for demonstration purposes.
 * In a real application, handle errors, token refresh, and security concerns appropriately.
 */

//@ts-nocheck

import { FetchApiClient, type ApiClientConfig } from "velos-ts/runtime";
import type { RequestConfig } from "velos-ts/runtime";
import { ProductRepository, AuthRepository } from "./generated/repositories";
// ==============================================================================
// Example 1: Basic Server-Side Cookie Authentication
// ==============================================================================

/**
 * Simple configuration for cookie-based authentication
 * The backend sets cookies, and they're sent automatically
 */
const basicApiClient = new FetchApiClient({
  baseUrl: "http://localhost:8080",

  // No auth token needed - cookies are sent automatically
  // The server sets cookies like:
  // Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict

  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Usage with repositories

const productRepo = new ProductRepository(basicApiClient);
const authRepo = new AuthRepository(basicApiClient);

// Example: Login request (server sets cookies in response)
async function login(email: string, password: string) {
  const result = await authRepo.login(
    { email, password },
    {
      withCredentials: true, // IMPORTANT: Required for cookies
    }
  );

  if (result.success) {
    console.log("✅ Logged in successfully");
    // Server has set HTTP-only cookies:
    // - session_id
    // - csrf_token (optional)
    // - refresh_token (optional)
  } else {
    console.error("❌ Login failed:", result.error);
  }

  return result;
}

// Example: Authenticated request (cookies sent automatically)
async function getProducts() {
  const result = await productRepo.getAllProducts();

  if (result.success) {
    console.log("📦 Products:", result.data);
  } else {
    console.error("❌ Failed to fetch products:", result.error);
  }

  return result;
}

// ==============================================================================
// Example 3: Complete Authentication Flow
// ==============================================================================

/**
 * Authentication service wrapper
 */
class AuthService {
  private authRepo: AuthRepository;

  constructor(apiClient: FetchApiClient) {
    this.authRepo = new AuthRepository(apiClient);
  }

  /**
   * Login user - server sets HTTP-only cookies
   */
  async login(email: string, password: string) {
    const result = await this.authRepo.login({
      email: email,
      password: password,
    });

    if (result.success) {
      console.log("✅ Login successful");
    }

    return result;
  }

  /**
   * Logout user - server clears cookies
   */
  async logout() {
    const result = await this.authRepo.logout(undefined, {
      withCredentials: true,
    });

    if (result.success) {
      console.log("✅ Logout successful");
      // Clear client-side data
      localStorage.removeItem("user");
    }

    return result;
  }

  /**
   * Check if user is authenticated (ping server)
   */
  async checkAuth() {
    const result = await this.authRepo.getCurrentUser();

    return result.success;
  }
}

const authService = new AuthService(basicApiClient);

const login_result = await authService.login("user@example.com", "PASSWORD123");
console.log("Login info:", login_result);

console.log("Fetching products after login...");
const products = await getProducts();
console.log("Products after login:", products);

// Note: In a real application, handle errors, token refresh, etc. as needed.

# Velos-ts Examples

This directory contains practical examples demonstrating how to use velos-ts generated repositories in different scenarios.

## Available Examples

### 1. [Generated Code Example](./generated-code-example.ts)

**Use Case:** Understanding what code velos-ts generates and how to use it

Demonstrates:
- Complete generated repository with response code documentation
- How frontend developers can use the JSDoc comments
- Error handling based on specific status codes
- UI/UX decisions based on expected responses
- Writing tests with known response codes

**Key Features:**
- ✅ Response codes documented in JSDoc
- ✅ Practical error handling examples
- ✅ React component examples
- ✅ Test examples

### 2. [Server-Side Cookie Authentication](./server-side-cookies-auth.ts)

**Use Case:** HTTP-only cookie-based authentication with CSRF protection

Demonstrates:
- Basic cookie authentication setup
- CSRF token handling with request interceptors
- Error handling for expired sessions
- Complete authentication flow (login, logout, checkAuth)
- React hook integration example
- Backend requirements and CORS configuration

**When to use:**
- Your backend uses HTTP-only cookies for session management
- You need CSRF protection for state-changing operations
- You want maximum security (cookies can't be accessed by JavaScript)

**Key Features:**
- ✅ Automatic cookie management
- ✅ CSRF token injection
- ✅ Session expiry handling
- ✅ Production-ready security patterns

---

## Running Examples

All examples are written in TypeScript and can be used as reference implementations.

### Copy and adapt to your project:

```bash
# 1. Copy the example you need
cp examples/server-side-cookies-auth.ts src/services/api-client.ts

# 2. Modify for your use case
# - Update baseUrl to your API endpoint
# - Adjust CSRF token retrieval method
# - Customize error handling

# 3. Import and use in your application
import { csrfApiClient } from './services/api-client';
import { OrderRepository } from './generated/repositories';

const orderRepo = new OrderRepository(csrfApiClient);
```

---

## Common Patterns

### Pattern 1: Always Include Credentials

For cookie-based authentication, you need to pass `withCredentials: true`:

```typescript
const result = await repository.someMethod(
  data,
  { withCredentials: true }  // Required for cookies
);
```

### Pattern 2: Use Request Interceptors

Add common headers or logic to all requests:

```typescript
const apiClient = new FetchApiClient({
  baseUrl: 'https://api.example.com',
  interceptors: {
    request: async (config) => {
      // Add custom headers
      config.headers = {
        ...config.headers,
        'X-Custom-Header': 'value',
      };
      return config;
    },
  },
});
```

### Pattern 3: Handle Auth Errors Globally

Use error interceptors for centralized error handling:

```typescript
const apiClient = new FetchApiClient({
  baseUrl: 'https://api.example.com',
  interceptors: {
    error: async (error: any) => {
      if (error?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }
      throw error;
    },
  },
});
```

---

## Contributing Examples

Have a useful pattern to share? Please contribute!

1. Create a new example file: `examples/your-example-name.ts`
2. Follow the existing format:
   - Clear comments explaining the use case
   - Multiple progressive examples (basic → advanced)
   - Real-world scenario demonstrations
   - Security considerations
3. Update this README with a summary
4. Submit a pull request

---

## Example Template

```typescript
/**
 * Example: [Your Example Name]
 *
 * This example demonstrates [what it does]
 *
 * Use Case:
 * - [When to use this]
 * - [What problem it solves]
 *
 * Prerequisites:
 * - [What you need]
 */

import { FetchApiClient } from 'velos-ts/runtime';

// ==============================================================================
// Example 1: Basic Usage
// ==============================================================================

// Your basic example here...

// ==============================================================================
// Example 2: Advanced Usage
// ==============================================================================

// Your advanced example here...

// ==============================================================================
// Summary
// ==============================================================================

/**
 * Key Points:
 * 1. [Point 1]
 * 2. [Point 2]
 */
```

---

## Additional Resources

- [Main Documentation](../README.md)
- [Configuration Guide](../docs/CONFIGURATION.md)
- [CLI Reference](../docs/CLI.md)
- [API Reference](../docs/)

---

## Need Help?

- [GitHub Issues](https://github.com/khyarih/velos-ts/issues)
- [Discussions](https://github.com/khyarih/velos-ts/discussions)

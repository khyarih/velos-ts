/**
 * Path Utility Functions
 * Utilities for working with file paths and URL patterns
 */

/**
 * Checks if a path matches a pattern with wildcard support
 *
 * Supports wildcards and path parameters:
 * - `**` matches any number of path segments (including zero)
 * - `*` matches within a single path segment
 * - `{param}` or `:param` matches a path parameter
 *
 * @param path - Path to check (e.g., '/api/v1/product/123')
 * @param pattern - Pattern with wildcards (e.g., '/api/v1/product/**')
 * @returns true if path matches pattern
 *
 * @example
 * ```typescript
 * matchesPattern('/api/v1/product/123', '/api/v1/product/**') // true
 * matchesPattern('/api/v1/product/123', '/api/v1/product/*') // true
 * matchesPattern('/api/auth/login', '/api/auth/**') // true
 * matchesPattern('/api/v1/users/123', '/api/v1/users/{id}') // true
 * ```
 */
export function matchesPattern(path: string, pattern: string): boolean {
  // Escape special regex characters except *, {, }, and /
  let regexPattern = pattern.replace(/[.+?^$()[\]\\|]/g, '\\$&');

  // Handle trailing wildcards specially - they should match anything including slashes
  const hasTrailingWildcard = regexPattern.endsWith('*');
  if (hasTrailingWildcard) {
    // Remove trailing * or ** and add .* at the end
    regexPattern = regexPattern.replace(/\*+$/, '') + '<<<TRAILING_WILDCARD>>>';
  }

  // Use a placeholder for ** to avoid conflicts with single *
  regexPattern = regexPattern.replace(/\*\*/g, '<<<GLOBSTAR>>>');

  // Replace path parameters {id} or :id with a regex that matches any value
  regexPattern = regexPattern.replace(/\{[^}]+\}/g, '[^/]+'); // {id} -> [^/]+
  regexPattern = regexPattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '[^/]+'); // :id -> [^/]+

  // Replace single * with [^/]* (matches any characters except /)
  regexPattern = regexPattern.replace(/\*/g, '[^/]*');

  // Replace the placeholder with .* (matches any characters including /)
  regexPattern = regexPattern.replace(/<<<GLOBSTAR>>>/g, '.*');
  regexPattern = regexPattern.replace(/<<<TRAILING_WILDCARD>>>/g, '.*');

  const regex = new RegExp('^' + regexPattern + '$');
  return regex.test(path);
}

/**
 * Checks if a path matches any of the given patterns
 *
 * @param path - Path to check
 * @param patterns - Array of patterns to match against
 * @returns true if path matches any pattern
 */
export function matchesAnyPattern(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesPattern(path, pattern));
}

/**
 * Normalizes a path by removing trailing slashes and double slashes
 *
 * @param path - Path to normalize
 * @returns Normalized path
 *
 * @example
 * ```typescript
 * normalizePath('/api/v1//product/') // '/api/v1/product'
 * normalizePath('//api/v1/') // '/api/v1'
 * normalizePath('api/v1/users') // '/api/v1/users'
 * normalizePath('/') // '/'
 * normalizePath('') // '/'
 * ```
 */
export function normalizePath(path: string): string {
  // Handle empty or root path
  if (!path || path === '/') {
    return '/';
  }

  // Replace multiple slashes with single slash and remove trailing slash
  let normalized = path.replace(/\/+/g, '/').replace(/\/$/, '');

  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return normalized;
}

/**
 * Joins path segments with proper handling of slashes
 *
 * @param segments - Path segments to join
 * @returns Joined path
 *
 * @example
 * ```typescript
 * joinPath('/api', 'v1', 'product') // '/api/v1/product'
 * joinPath('/api/', '/v1/', '/product/') // '/api/v1/product'
 * ```
 */
export function joinPath(...segments: string[]): string {
  const joined = segments
    .filter((segment) => segment && segment.length > 0)
    .map((segment) => segment.replace(/^\/|\/$/g, ''))
    .join('/');

  const startsWithSlash = segments[0]?.startsWith('/');
  return startsWithSlash ? `/${joined}` : joined;
}

/**
 * Extracts path segments from a URL path
 *
 * @param path - URL path to split
 * @returns Array of path segments (excluding empty segments)
 *
 * @example
 * ```typescript
 * getPathSegments('/api/v1/product/123') // ['api', 'v1', 'product', '123']
 * getPathSegments('/api//v1/') // ['api', 'v1']
 * ```
 */
export function getPathSegments(path: string): string[] {
  return path.split('/').filter((segment) => segment && segment.length > 0);
}

/**
 * Extracts the last segment from a path
 *
 * @param path - URL path
 * @returns Last path segment
 *
 * @example
 * ```typescript
 * getLastSegment('/api/v1/product') // 'product'
 * getLastSegment('/api/v1/product/') // 'product'
 * ```
 */
export function getLastSegment(path: string): string {
  const segments = getPathSegments(path);
  return segments[segments.length - 1] || '';
}

/**
 * Gets the parent path of a given path
 *
 * @param path - URL path
 * @returns Parent path
 *
 * @example
 * ```typescript
 * getParentPath('/api/v1/product/123') // '/api/v1/product'
 * getParentPath('/api/v1/product') // '/api/v1'
 * ```
 */
export function getParentPath(path: string): string {
  const segments = getPathSegments(path);
  segments.pop();
  return '/' + segments.join('/');
}

/**
 * Checks if a path contains path parameters (e.g., {id}, :id)
 *
 * @param path - URL path to check
 * @returns true if path contains parameters
 *
 * @example
 * ```typescript
 * hasPathParameters('/api/v1/product/{id}') // true
 * hasPathParameters('/api/v1/product') // false
 * ```
 */
export function hasPathParameters(path: string): boolean {
  return /\{[^}]+\}|:[a-zA-Z_][a-zA-Z0-9_]*/.test(path);
}

/**
 * Extracts path parameter names from a path
 *
 * @param path - URL path
 * @returns Array of parameter names
 *
 * @example
 * ```typescript
 * extractPathParameters('/api/v1/product/{id}/variant/{variantId}') // ['id', 'variantId']
 * extractPathParameters('/api/v1/product/:id') // ['id']
 * ```
 */
export function extractPathParameters(path: string): string[] {
  const braceParams = [...path.matchAll(/\{([^}]+)\}/g)]
    .map((match) => match[1])
    .filter((param): param is string => param !== undefined);
  const colonParams = [...path.matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)]
    .map((match) => match[1])
    .filter((param): param is string => param !== undefined);
  return [...braceParams, ...colonParams];
}

/**
 * Removes path parameters from a path, leaving placeholders
 *
 * @param path - URL path with parameters
 * @param placeholder - Placeholder to use (default: '*')
 * @returns Path with parameters replaced
 *
 * @example
 * ```typescript
 * removePathParameters('/api/v1/product/{id}') // '/api/v1/product/*'
 * removePathParameters('/api/v1/product/{id}/variant/{variantId}', ':param')
 * // '/api/v1/product/:param/variant/:param'
 * ```
 */
export function removePathParameters(path: string, placeholder: string = '*'): string {
  return path.replace(/\{[^}]+\}/g, placeholder).replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, placeholder);
}

/**
 * Gets the base path (path without parameters)
 *
 * @param path - URL path with parameters
 * @returns Base path without parameter segments
 *
 * @example
 * ```typescript
 * getBasePath('/api/v1/product/{id}') // '/api/v1/product'
 * getBasePath('/api/v1/product/{id}/details') // '/api/v1/product'
 * ```
 */
export function getBasePath(path: string): string {
  const segments = getPathSegments(path);
  const baseSegments = [];

  for (const segment of segments) {
    if (hasPathParameters(segment)) {
      break;
    }
    baseSegments.push(segment);
  }

  return '/' + baseSegments.join('/');
}

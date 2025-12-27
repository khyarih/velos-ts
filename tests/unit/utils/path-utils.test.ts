/**
 * Tests for Path Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  matchesPattern,
  getPathSegments,
  extractPathParameters,
  normalizePath,
  joinPath,
  getLastSegment,
  getParentPath,
  hasPathParameters,
  removePathParameters,
  getBasePath,
  matchesAnyPattern,
} from '@/utils/path-utils';

describe('Path Utilities', () => {
  describe('matchesPattern()', () => {
    it('should match exact paths', () => {
      expect(matchesPattern('/api/v1/users', '/api/v1/users')).toBe(true);
      expect(matchesPattern('/api/v1/products', '/api/v1/products')).toBe(true);
    });

    it('should not match different paths', () => {
      expect(matchesPattern('/api/v1/users', '/api/v1/products')).toBe(false);
      expect(matchesPattern('/api/v1/users', '/api/v2/users')).toBe(false);
    });

    it('should match single-segment wildcards (*)', () => {
      expect(matchesPattern('/api/v1/users', '/api/*/users')).toBe(true);
      expect(matchesPattern('/api/v2/users', '/api/*/users')).toBe(true);
      expect(matchesPattern('/api/v1/users', '/api/v1/*')).toBe(true);
      expect(matchesPattern('/api/v1/products', '/api/v1/*')).toBe(true);
    });

    it('should not match multi-segment wildcards with single *', () => {
      expect(matchesPattern('/api/v1/admin/users', '/api/*/users')).toBe(false);
    });

    it('should match recursive wildcards (**)', () => {
      expect(matchesPattern('/api/v1/users', '/api/**')).toBe(true);
      expect(matchesPattern('/api/v1/admin/users', '/api/**')).toBe(true);
      expect(matchesPattern('/api/v1/admin/users/123', '/api/**')).toBe(true);
    });

    it('should match patterns with ** in the middle', () => {
      expect(matchesPattern('/api/v1/users', '/api/**/users')).toBe(true);
      expect(matchesPattern('/api/v1/admin/users', '/api/**/users')).toBe(true);
      expect(matchesPattern('/api/admin/users', '/api/**/users')).toBe(true);
    });

    it('should match trailing wildcards', () => {
      expect(matchesPattern('/api/v1/users', '/api/v1/users*')).toBe(true);
      expect(matchesPattern('/api/v1/users/123', '/api/v1/users*')).toBe(true);
      expect(matchesPattern('/api/v1/products', '/api/v1/product**')).toBe(true);
      expect(matchesPattern('/api/v1/products/123', '/api/v1/product**')).toBe(true);
    });

    it('should handle path parameters', () => {
      expect(matchesPattern('/api/v1/users/123', '/api/v1/users/{id}')).toBe(true);
      expect(
        matchesPattern('/api/v1/users/123/posts/456', '/api/v1/users/{userId}/posts/{postId}')
      ).toBe(true);
    });

    it('should handle complex patterns', () => {
      expect(matchesPattern('/api/v1/users/123/profile', '/api/v*/users/**')).toBe(true);
      expect(matchesPattern('/api/v1/admin/users/123', '/api/**/admin/**')).toBe(true);
    });

    it('should be case-sensitive by default', () => {
      expect(matchesPattern('/api/v1/Users', '/api/v1/users')).toBe(false);
      expect(matchesPattern('/API/v1/users', '/api/v1/users')).toBe(false);
    });
  });

  describe('getPathSegments()', () => {
    it('should split path into segments', () => {
      expect(getPathSegments('/api/v1/users')).toEqual(['api', 'v1', 'users']);
      expect(getPathSegments('/api/v1/products/123')).toEqual(['api', 'v1', 'products', '123']);
    });

    it('should handle leading and trailing slashes', () => {
      expect(getPathSegments('/api/v1/users/')).toEqual(['api', 'v1', 'users']);
      expect(getPathSegments('api/v1/users')).toEqual(['api', 'v1', 'users']);
      expect(getPathSegments('/api/v1/users')).toEqual(['api', 'v1', 'users']);
    });

    it('should filter empty segments', () => {
      expect(getPathSegments('/api//v1///users')).toEqual(['api', 'v1', 'users']);
    });

    it('should handle root path', () => {
      expect(getPathSegments('/')).toEqual([]);
      expect(getPathSegments('')).toEqual([]);
    });

    it('should handle single segment', () => {
      expect(getPathSegments('/users')).toEqual(['users']);
    });
  });

  describe('extractPathParameters()', () => {
    it('should extract path parameters', () => {
      const params = extractPathParameters('/api/v1/users/{id}');
      expect(params).toEqual(['id']);
    });

    it('should extract multiple parameters', () => {
      const params = extractPathParameters('/api/v1/users/{userId}/posts/{postId}');
      expect(params).toEqual(['userId', 'postId']);
    });

    it('should handle no parameters', () => {
      const params = extractPathParameters('/api/v1/users');
      expect(params).toEqual([]);
    });

    it('should handle parameters at different positions', () => {
      const params = extractPathParameters('/{version}/users/{id}/profile');
      expect(params).toEqual(['version', 'id']);
    });

    it('should preserve parameter order', () => {
      const params = extractPathParameters('/users/{userId}/posts/{postId}/comments/{commentId}');
      expect(params).toEqual(['userId', 'postId', 'commentId']);
    });

    it('should handle complex parameter patterns', () => {
      const params = extractPathParameters('/api/v1/{resource}/{id}/sub/{subId}');
      expect(params).toEqual(['resource', 'id', 'subId']);
    });
  });

  describe('normalizePath()', () => {
    it('should normalize paths with leading slash', () => {
      expect(normalizePath('api/v1/users')).toBe('/api/v1/users');
      expect(normalizePath('/api/v1/users')).toBe('/api/v1/users');
    });

    it('should remove trailing slashes', () => {
      expect(normalizePath('/api/v1/users/')).toBe('/api/v1/users');
      expect(normalizePath('/api/v1/users///')).toBe('/api/v1/users');
    });

    it('should collapse multiple slashes', () => {
      expect(normalizePath('/api//v1///users')).toBe('/api/v1/users');
    });

    it('should handle root path', () => {
      expect(normalizePath('/')).toBe('/');
      expect(normalizePath('')).toBe('/');
    });

    it('should preserve path parameters', () => {
      expect(normalizePath('/api/v1/users/{id}')).toBe('/api/v1/users/{id}');
      expect(normalizePath('/users/{userId}/posts/{postId}')).toBe(
        '/users/{userId}/posts/{postId}'
      );
    });
  });

  describe('Real-world scenarios', () => {
    it('should match typical API patterns', () => {
      // Include all v1 endpoints
      expect(matchesPattern('/api/v1/users', '/api/v1/**')).toBe(true);
      expect(matchesPattern('/api/v1/users/123', '/api/v1/**')).toBe(true);
      expect(matchesPattern('/api/v1/admin/users', '/api/v1/**')).toBe(true);

      // Exclude admin endpoints
      expect(matchesPattern('/api/v1/admin/users', '**/admin/**')).toBe(true);
      expect(matchesPattern('/api/v1/users', '**/admin/**')).toBe(false);
    });

    it('should handle resource-specific patterns', () => {
      // All product endpoints
      expect(matchesPattern('/api/v1/products', '/api/v1/product**')).toBe(true);
      expect(matchesPattern('/api/v1/products/123', '/api/v1/product**')).toBe(true);
      expect(matchesPattern('/api/v1/products/123/reviews', '/api/v1/product**')).toBe(true);

      // Should not match similar names
      expect(matchesPattern('/api/v1/production', '/api/v1/product**')).toBe(true); // Note: ** matches everything after
    });

    it('should extract parameters from RESTful paths', () => {
      expect(extractPathParameters('/api/v1/users/{id}')).toEqual(['id']);
      expect(
        extractPathParameters('/api/v1/users/{userId}/posts/{postId}/comments/{commentId}')
      ).toEqual(['userId', 'postId', 'commentId']);
    });

    it('should normalize various path formats', () => {
      const paths = ['api/v1/users', '/api/v1/users', '/api/v1/users/', '//api//v1//users//'];

      const normalized = paths.map((p) => normalizePath(p));
      expect(normalized.every((p) => p === '/api/v1/users')).toBe(true);
    });
  });

  describe('joinPath()', () => {
    it('should join path segments', () => {
      expect(joinPath('/api', 'v1', 'users')).toBe('/api/v1/users');
      expect(joinPath('api', 'v1', 'users')).toBe('api/v1/users');
    });

    it('should handle leading and trailing slashes', () => {
      expect(joinPath('/api/', '/v1/', '/users/')).toBe('/api/v1/users');
    });

    it('should filter empty segments', () => {
      expect(joinPath('/api', '', 'v1', '', 'users')).toBe('/api/v1/users');
    });
  });

  describe('getLastSegment()', () => {
    it('should get the last segment', () => {
      expect(getLastSegment('/api/v1/product')).toBe('product');
      expect(getLastSegment('/api/v1/product/')).toBe('product');
    });

    it('should return empty string for root path', () => {
      expect(getLastSegment('/')).toBe('');
    });
  });

  describe('getParentPath()', () => {
    it('should get the parent path', () => {
      expect(getParentPath('/api/v1/product/123')).toBe('/api/v1/product');
      expect(getParentPath('/api/v1/product')).toBe('/api/v1');
    });

    it('should handle root paths', () => {
      expect(getParentPath('/api')).toBe('/');
    });
  });

  describe('hasPathParameters()', () => {
    it('should detect brace parameters', () => {
      expect(hasPathParameters('/api/v1/product/{id}')).toBe(true);
    });

    it('should detect colon parameters', () => {
      expect(hasPathParameters('/api/v1/product/:id')).toBe(true);
    });

    it('should return false for paths without parameters', () => {
      expect(hasPathParameters('/api/v1/product')).toBe(false);
    });
  });

  describe('removePathParameters()', () => {
    it('should remove brace parameters', () => {
      expect(removePathParameters('/api/v1/product/{id}')).toBe('/api/v1/product/*');
    });

    it('should remove colon parameters', () => {
      expect(removePathParameters('/api/v1/product/:id')).toBe('/api/v1/product/*');
    });

    it('should use custom placeholder', () => {
      expect(removePathParameters('/api/v1/product/{id}', ':param')).toBe('/api/v1/product/:param');
    });
  });

  describe('getBasePath()', () => {
    it('should get base path before parameters', () => {
      expect(getBasePath('/api/v1/product/{id}')).toBe('/api/v1/product');
    });

    it('should handle paths with parameters in middle', () => {
      expect(getBasePath('/api/v1/product/{id}/details')).toBe('/api/v1/product');
    });

    it('should return full path if no parameters', () => {
      expect(getBasePath('/api/v1/product')).toBe('/api/v1/product');
    });
  });

  describe('matchesAnyPattern()', () => {
    it('should match if any pattern matches', () => {
      expect(matchesAnyPattern('/api/v1/users', ['/api/**', '/admin/**'])).toBe(true);
    });

    it('should return false if no patterns match', () => {
      expect(matchesAnyPattern('/api/v1/users', ['/admin/**', '/public/**'])).toBe(false);
    });
  });
});

/**
 * Tests for String Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  singularize,
  pluralize,
} from '@/utils/string-utils';

describe('String Utilities', () => {
  describe('toPascalCase()', () => {
    it('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('user_profile')).toBe('UserProfile');
      expect(toPascalCase('product_category_item')).toBe('ProductCategoryItem');
    });

    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('user-profile')).toBe('UserProfile');
      expect(toPascalCase('product-category-item')).toBe('ProductCategoryItem');
    });

    it('should convert camelCase to PascalCase', () => {
      expect(toPascalCase('userProfile')).toBe('UserProfile');
      expect(toPascalCase('productCategoryItem')).toBe('ProductCategoryItem');
    });

    it('should handle single words', () => {
      expect(toPascalCase('user')).toBe('User');
      expect(toPascalCase('product')).toBe('Product');
    });

    it('should handle already PascalCase strings', () => {
      expect(toPascalCase('UserProfile')).toBe('UserProfile');
      expect(toPascalCase('ProductCategory')).toBe('ProductCategory');
    });

    it('should handle multiple separators', () => {
      expect(toPascalCase('user_profile-item')).toBe('UserProfileItem');
    });

    it('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });
  });

  describe('toCamelCase()', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('user_profile')).toBe('userProfile');
      expect(toCamelCase('product_category_item')).toBe('productCategoryItem');
    });

    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('user-profile')).toBe('userProfile');
      expect(toCamelCase('product-category-item')).toBe('productCategoryItem');
    });

    it('should convert PascalCase to camelCase', () => {
      expect(toCamelCase('UserProfile')).toBe('userProfile');
      expect(toCamelCase('ProductCategoryItem')).toBe('productCategoryItem');
    });

    it('should handle single words', () => {
      expect(toCamelCase('user')).toBe('user');
      expect(toCamelCase('product')).toBe('product');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('userProfile')).toBe('userProfile');
      expect(toCamelCase('productCategory')).toBe('productCategory');
    });

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });
  });

  describe('toKebabCase()', () => {
    it('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile');
      expect(toKebabCase('ProductCategoryItem')).toBe('product-category-item');
    });

    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('userProfile')).toBe('user-profile');
      expect(toKebabCase('productCategoryItem')).toBe('product-category-item');
    });

    it('should convert snake_case to kebab-case', () => {
      expect(toKebabCase('user_profile')).toBe('user-profile');
      expect(toKebabCase('product_category_item')).toBe('product-category-item');
    });

    it('should handle single words', () => {
      expect(toKebabCase('user')).toBe('user');
      expect(toKebabCase('product')).toBe('product');
    });

    it('should handle already kebab-case strings', () => {
      expect(toKebabCase('user-profile')).toBe('user-profile');
      expect(toKebabCase('product-category')).toBe('product-category');
    });

    it('should handle empty string', () => {
      expect(toKebabCase('')).toBe('');
    });
  });

  describe('toSnakeCase()', () => {
    it('should convert PascalCase to snake_case', () => {
      expect(toSnakeCase('UserProfile')).toBe('user_profile');
      expect(toSnakeCase('ProductCategoryItem')).toBe('product_category_item');
    });

    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userProfile')).toBe('user_profile');
      expect(toSnakeCase('productCategoryItem')).toBe('product_category_item');
    });

    it('should convert kebab-case to snake_case', () => {
      expect(toSnakeCase('user-profile')).toBe('user_profile');
      expect(toSnakeCase('product-category-item')).toBe('product_category_item');
    });

    it('should handle single words', () => {
      expect(toSnakeCase('user')).toBe('user');
      expect(toSnakeCase('product')).toBe('product');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnakeCase('user_profile')).toBe('user_profile');
      expect(toSnakeCase('product_category')).toBe('product_category');
    });

    it('should handle empty string', () => {
      expect(toSnakeCase('')).toBe('');
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('user')).toBe('User');
      expect(capitalize('product')).toBe('Product');
    });

    it('should not change already capitalized strings', () => {
      expect(capitalize('User')).toBe('User');
      expect(capitalize('Product')).toBe('Product');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('z')).toBe('Z');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should only capitalize first letter', () => {
      expect(capitalize('user profile')).toBe('User profile');
      expect(capitalize('product-item')).toBe('Product-item');
    });
  });

  describe('singularize()', () => {
    it('should singularize common plural forms', () => {
      expect(singularize('users')).toBe('user');
      expect(singularize('products')).toBe('product');
      expect(singularize('categories')).toBe('category');
    });

    it('should handle -ies endings', () => {
      expect(singularize('categories')).toBe('category');
      expect(singularize('companies')).toBe('company');
      expect(singularize('stories')).toBe('story');
    });

    it('should handle -es endings', () => {
      expect(singularize('boxes')).toBe('box');
      expect(singularize('matches')).toBe('match');
      expect(singularize('addresses')).toBe('address');
    });

    it('should handle -s endings', () => {
      expect(singularize('users')).toBe('user');
      expect(singularize('items')).toBe('item');
      expect(singularize('orders')).toBe('order');
    });

    it('should not change already singular words', () => {
      expect(singularize('user')).toBe('user');
      expect(singularize('product')).toBe('product');
    });

    it('should handle edge cases', () => {
      expect(singularize('data')).toBe('data'); // already singular/plural
      expect(singularize('sheep')).toBe('sheep'); // same singular/plural
    });

    it('should handle empty string', () => {
      expect(singularize('')).toBe('');
    });
  });

  describe('pluralize()', () => {
    it('should pluralize common words', () => {
      expect(pluralize('user')).toBe('users');
      expect(pluralize('product')).toBe('products');
      expect(pluralize('item')).toBe('items');
    });

    it('should handle -y endings', () => {
      expect(pluralize('category')).toBe('categories');
      expect(pluralize('company')).toBe('companies');
      expect(pluralize('story')).toBe('stories');
    });

    it('should handle words ending in -s, -x, -z, -ch, -sh', () => {
      expect(pluralize('box')).toBe('boxes');
      expect(pluralize('match')).toBe('matches');
      expect(pluralize('address')).toBe('addresses');
    });

    it('should not change already plural words', () => {
      expect(pluralize('users')).toBe('users');
      expect(pluralize('products')).toBe('products');
    });

    it('should handle edge cases', () => {
      expect(pluralize('data')).toBe('data'); // stays the same
    });

    it('should handle empty string', () => {
      expect(pluralize('')).toBe('');
    });
  });

  describe('Round-trip conversions', () => {
    it('should handle singularize then pluralize', () => {
      expect(pluralize(singularize('users'))).toBe('users');
      expect(pluralize(singularize('categories'))).toBe('categories');
      expect(pluralize(singularize('items'))).toBe('items');
    });

    it('should handle case conversions round-trip', () => {
      const original = 'UserProfile';
      const kebab = toKebabCase(original);
      const snake = toSnakeCase(original);
      const camel = toCamelCase(original);

      expect(toPascalCase(kebab)).toBe(original);
      expect(toPascalCase(snake)).toBe(original);
      expect(toPascalCase(camel)).toBe(original);
    });
  });
});

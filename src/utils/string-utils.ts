/**
 * String Utility Functions
 * Common string manipulation utilities for code generation
 */

/**
 * Singularizes a word (basic implementation)
 *
 * Handles common English pluralization rules:
 * - words ending in 'ies' → 'y' (categories → category)
 * - words ending in 'es' → remove 'es' for sibilants (boxes → box)
 * - words ending in 's' → remove 's' (products → product)
 *
 * @param word - Word to singularize
 * @returns Singularized word
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  } else if (
    word.endsWith('es') &&
    (word.endsWith('sses') ||
      word.endsWith('xes') ||
      word.endsWith('zes') ||
      word.endsWith('ches') ||
      word.endsWith('shes'))
  ) {
    return word.slice(0, -2);
  } else if (word.endsWith('s') && !word.endsWith('ss') && word.length > 1) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Converts a string to PascalCase
 *
 * If the string is already in PascalCase or camelCase (no delimiters), preserve the casing.
 * Otherwise, convert from kebab-case, snake_case, etc.
 *
 * @param str - String to convert
 * @returns PascalCase string
 *
 * @example
 * ```typescript
 * toPascalCase('product-variant') // 'ProductVariant'
 * toPascalCase('user_profile') // 'UserProfile'
 * toPascalCase('ProductDTO') // 'ProductDTO' (preserved)
 * ```
 */
export function toPascalCase(str: string): string {
  // If string is already PascalCase or camelCase (no delimiters), preserve it but ensure first letter is uppercase
  if (!/[-_/\s]+/.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Otherwise, split on delimiters and capitalize each word
  return str
    .split(/[-_/\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to camelCase
 *
 * @param str - String to convert
 * @returns camelCase string
 *
 * @example
 * ```typescript
 * toCamelCase('product-variant') // 'productVariant'
 * toCamelCase('user_profile') // 'userProfile'
 * ```
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case
 *
 * @param str - String to convert
 * @returns kebab-case string
 *
 * @example
 * ```typescript
 * toKebabCase('ProductVariant') // 'product-variant'
 * toKebabCase('userProfile') // 'user-profile'
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case
 *
 * @param str - String to convert
 * @returns snake_case string
 *
 * @example
 * ```typescript
 * toSnakeCase('ProductVariant') // 'product_variant'
 * toSnakeCase('userProfile') // 'user_profile'
 * ```
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Uncapitalizes the first letter of a string
 *
 * @param str - String to uncapitalize
 * @returns Uncapitalized string
 */
export function uncapitalize(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Pluralizes a word (basic implementation)
 *
 * Handles common English pluralization rules:
 * - already plural → no change (users → users)
 * - irregular plurals → no change (data → data)
 * - words ending in 'y' → 'ies' (category → categories)
 * - words ending in sibilants → add 'es' (box → boxes)
 * - default → add 's' (product → products)
 *
 * @param word - Word to pluralize
 * @returns Pluralized word
 */
export function pluralize(word: string): string {
  if (!word) {
    return '';
  }

  // Already plural or irregular plural forms
  const irregularPlurals = new Set(['data', 'information', 'sheep', 'fish', 'deer', 'species']);
  if (irregularPlurals.has(word.toLowerCase())) {
    return word;
  }

  // Check if already plural (ends with 's' and not a special case)
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    return word;
  }

  // Apply pluralization rules
  if (word.endsWith('y') && word.length > 1 && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  } else if (
    word.endsWith('s') ||
    word.endsWith('x') ||
    word.endsWith('z') ||
    word.endsWith('ch') ||
    word.endsWith('sh')
  ) {
    return word + 'es';
  }
  return word + 's';
}

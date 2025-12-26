/**
 * Utility Functions Module
 * Exports all utility functions
 */

// String utilities
export {
  singularize,
  pluralize,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  uncapitalize,
} from './string-utils';

// Path utilities
export {
  matchesPattern,
  matchesAnyPattern,
  normalizePath,
  joinPath,
  getPathSegments,
  getLastSegment,
  getParentPath,
  hasPathParameters,
  extractPathParameters,
  removePathParameters,
  getBasePath,
} from './path-utils';

// Schema utilities
export {
  extractSchemaName,
  isRef,
  extractSchemaRefs,
  buildTypeReference,
  isGenericType,
  parseGenericType,
  toTypeScriptGeneric,
  isPrimitiveType,
  openApiTypeToTypeScript,
  sanitizeSchemaName,
} from './schema-utils';

// File utilities
export {
  ensureDirectory,
  ensureDirectorySync,
  writeFile,
  writeFileSync,
  readFile,
  readFileSync,
  readJsonFile,
  readJsonFileSync,
  fileExists,
  fileExistsSync,
  deleteFile,
  deleteFileSync,
  listFiles,
  listFilesSync,
  listDirectories,
  getRelativePath,
  resolvePath,
  getFileExtension,
  getFileNameWithoutExtension,
  toModulePath,
} from './file-utils';

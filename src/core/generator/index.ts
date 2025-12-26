/**
 * Generator Module
 * Exports all code generation functionality
 */

// Import generator
export {
  generateImports,
  generateCustomImport,
  generateDefaultImport,
  generateNamespaceImport,
  combineImports,
} from './import-generator';

// Type alias generator
export {
  generateTypeAliases,
  generateQueryParamTypes,
  generateQueryParamInterface,
  generateAllTypes,
} from './type-alias-generator';

// Method generator
export {
  generateMethod,
  getMethodName,
  extractMethodSignature,
  generateMethodBody,
  generateAllMethods,
} from './method-generator';

// Interface generator
export { generateInterface, getInterfaceName, getClassName } from './interface-generator';

// Repository generator
export { generateRepository, generateAllRepositories } from './repository-generator';

// Index generator
export { generateIndexFile, generateReadme, generateSummary } from './index-generator';

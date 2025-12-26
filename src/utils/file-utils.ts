/**
 * File Utility Functions
 * Utilities for file and directory operations
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures a directory exists, creating it recursively if needed
 *
 * @param dirPath - Directory path to ensure
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Ensures a directory exists synchronously
 *
 * @param dirPath - Directory path to ensure
 */
export function ensureDirectorySync(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes a file, creating directories if needed
 *
 * @param filePath - File path to write
 * @param content - File content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  await fs.promises.writeFile(filePath, content, 'utf-8');
}

/**
 * Writes a file synchronously, creating directories if needed
 *
 * @param filePath - File path to write
 * @param content - File content
 */
export function writeFileSync(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDirectorySync(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Reads a file as string
 *
 * @param filePath - File path to read
 * @returns File content
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.promises.readFile(filePath, 'utf-8');
}

/**
 * Reads a file synchronously
 *
 * @param filePath - File path to read
 * @returns File content
 */
export function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Reads and parses a JSON file
 *
 * @param filePath - JSON file path
 * @returns Parsed JSON object
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  return JSON.parse(content) as T;
}

/**
 * Reads and parses a JSON file synchronously
 *
 * @param filePath - JSON file path
 * @returns Parsed JSON object
 */
export function readJsonFileSync<T = unknown>(filePath: string): T {
  const content = readFileSync(filePath);
  return JSON.parse(content) as T;
}

/**
 * Checks if a file exists
 *
 * @param filePath - File path to check
 * @returns true if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a file exists synchronously
 *
 * @param filePath - File path to check
 * @returns true if file exists
 */
export function fileExistsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Deletes a file if it exists
 *
 * @param filePath - File path to delete
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    // Ignore error if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Deletes a file synchronously if it exists
 *
 * @param filePath - File path to delete
 */
export function deleteFileSync(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    // Ignore error if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Lists all files in a directory (non-recursive)
 *
 * @param dirPath - Directory path
 * @returns Array of file names
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

/**
 * Lists all files in a directory synchronously (non-recursive)
 *
 * @param dirPath - Directory path
 * @returns Array of file names
 */
export function listFilesSync(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

/**
 * Lists all directories in a directory (non-recursive)
 *
 * @param dirPath - Directory path
 * @returns Array of directory names
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/**
 * Gets the relative path from one file to another
 *
 * @param from - Source file path
 * @param to - Target file path
 * @returns Relative path
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(path.dirname(from), to);
}

/**
 * Resolves a path relative to the current working directory
 *
 * @param relativePath - Relative path
 * @returns Absolute path
 */
export function resolvePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Gets file extension from a file path
 *
 * @param filePath - File path
 * @returns File extension (including dot)
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Gets file name without extension
 *
 * @param filePath - File path
 * @returns File name without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Converts a file path to a module import path
 *
 * @param filePath - File path
 * @param removeExtension - Whether to remove the extension
 * @returns Module import path
 */
export function toModulePath(filePath: string, removeExtension: boolean = true): string {
  let modulePath = filePath.replace(/\\/g, '/');

  if (removeExtension) {
    modulePath = modulePath.replace(/\.(ts|js|tsx|jsx)$/, '');
  }

  if (!modulePath.startsWith('.') && !modulePath.startsWith('/')) {
    modulePath = './' + modulePath;
  }

  return modulePath;
}

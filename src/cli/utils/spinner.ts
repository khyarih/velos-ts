/**
 * Spinner Utilities
 * Provides loading indicators for long-running operations
 */

import ora from 'ora';

/**
 * Creates and manages a spinner
 */
export class Spinner {
  private spinner: ReturnType<typeof ora>;

  constructor(text: string) {
    this.spinner = ora(text);
  }

  /**
   * Starts the spinner
   */
  start(): void {
    this.spinner.start();
  }

  /**
   * Updates spinner text
   */
  text(text: string): void {
    this.spinner.text = text;
  }

  /**
   * Marks spinner as successful
   */
  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  /**
   * Marks spinner as failed
   */
  fail(text?: string): void {
    this.spinner.fail(text);
  }

  /**
   * Marks spinner as warning
   */
  warn(text?: string): void {
    this.spinner.warn(text);
  }

  /**
   * Marks spinner as info
   */
  info(text?: string): void {
    this.spinner.info(text);
  }

  /**
   * Stops spinner
   */
  stop(): void {
    this.spinner.stop();
  }

  /**
   * Clears spinner
   */
  clear(): void {
    this.spinner.clear();
  }
}

/**
 * Creates a new spinner
 */
export function createSpinner(text: string): Spinner {
  return new Spinner(text);
}

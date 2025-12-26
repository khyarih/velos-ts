/**
 * Logger Utilities
 * Provides colored console logging
 */

import chalk from 'chalk';

/**
 * Logger class for consistent CLI output
 */
export class Logger {
  /**
   * Logs an info message
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Logs a success message
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * Logs a warning message
   */
  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * Logs an error message
   */
  static error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  /**
   * Logs a step message
   */
  static step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  }

  /**
   * Logs a heading
   */
  static heading(message: string): void {
    console.log('');
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('='.repeat(message.length)));
  }

  /**
   * Logs a subheading
   */
  static subheading(message: string): void {
    console.log('');
    console.log(chalk.bold(message));
  }

  /**
   * Logs a message without formatting
   */
  static log(message: string): void {
    console.log(message);
  }

  /**
   * Logs an empty line
   */
  static line(): void {
    console.log('');
  }

  /**
   * Logs a table
   */
  static table(data: Array<[string, string | number]>): void {
    const maxKeyLength = Math.max(...data.map(([key]) => key.length));

    data.forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(`  ${chalk.gray(paddedKey)} ${chalk.white(value)}`);
    });
  }

  /**
   * Logs a list
   */
  static list(items: string[]): void {
    items.forEach((item) => {
      console.log(`  ${chalk.gray('•')} ${item}`);
    });
  }

  /**
   * Creates a section divider
   */
  static divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }
}

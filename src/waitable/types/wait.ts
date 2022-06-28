export interface WaitOptions {
  /**
   * If specified, the interval after which the `wait` function will resolve with `'timeout'` if the waitable is still incomplete.
   *
   * @defaultValue unlimited
   */
  timeoutMSec?: number;
}

/**
 * - `'success'` - has a value
 * - `'failure'` - has an error value
 * - `'reset'` - was reset before a value could be resolved
 * - `'timeout'` - didn't resolve a value before the specified timeout
 */
export type WaitResult = 'failure' | 'reset' | 'success' | 'timeout';

import type { TypeOrDeferredType } from 'react-bindings';

export interface WaitOptions {
  /**
   * Checked if a failure occurs while waiting.  If `true`, continues waiting.  Otherwise, stops waiting and the `wait` function returns
   * `'failure'`
   *
   * @defaultValue `false`
   */
  continueWaitingOnFailure?: TypeOrDeferredType<boolean>;
  /**
   * Checked if a reset occurs while waiting.  If `true`, continues waiting.  Otherwise, stops waiting and the `wait` function returns
   * `'reset'`
   *
   * @defaultValue `true`
   */
  continueWaitingOnReset?: TypeOrDeferredType<boolean>;
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

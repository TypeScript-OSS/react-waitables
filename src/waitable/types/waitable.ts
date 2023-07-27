import type { Binding, ReadonlyBinding } from 'react-bindings';

import type { ResetType } from './reset';
import type { WaitOptions, WaitResult } from './wait';
import type { WrappedResult } from './wrapped-result';

/**
 * A state representation for a value or error producing, synchronous or asynchronous, function, which may:
 *
 * - have a value or error, or not
 * - be complete or incomplete
 * - be busy or not
 * - be locked or unlocked
 * - be waited for
 * - be reset, allowing the task to be restarted
 */
export interface Waitable<SuccessT, FailureT = any> {
  /** A marker indicating that this is a waitable type */
  isWaitable: true;

  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;

  /** The success value or undefined if either incomplete or an error occurred. */
  value: ReadonlyBinding<SuccessT | undefined>;
  /** The failure value or undefined if either incomplete or completed successfully. */
  error: ReadonlyBinding<FailureT | undefined>;

  /** This can be used to force the waitable to have a specified value or error -- usually for testing. */
  force: Binding<WrappedResult<SuccessT, FailureT> | undefined>;

  /** If `true`, the primary function is being run / waited for */
  isBusy: ReadonlyBinding<boolean>;
  /** If `true`, either the value or error have a defined value */
  isComplete: ReadonlyBinding<boolean>;

  /** If `true`, this waitable is locked and the primary function won't be started */
  isLocked: ReadonlyBinding<boolean>;
  /** If `true`, the waitable is locked and doesn't already have a value (ex. from a default value) */
  isLockedWithoutValue: ReadonlyBinding<boolean>;

  /**
   * Resets the waitable so that the primary function can run again.
   *
   * @param resetType - If `'soft'`, current values are kept (though errors are cleared).  If `'hard'`, both current value and errors are
   * cleared.
   */
  reset: (resetType: ResetType) => void;
  /** Returns a promise that resolves when the waitable is complete or reset or when this call times out */
  wait: (options?: WaitOptions) => Promise<WaitResult>;
}

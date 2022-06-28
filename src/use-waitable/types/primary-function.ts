import type { TypeOrPromisedType } from '../../resolveable/types';

export type WaitablePrimaryFunction<SuccessT, FailureT = any> = (args: {
  /**
   * Call to set the waitable's value.
   *
   * Calling `setSuccess` with an undefined value marks the waitable as no longer busy but still incomplete.  To rerun the primary function,
   * `reset` must be used.
   *
   * Calling `setSuccess` more than once and/or after a `setFailure` call is allowed and will make the waitable successful with the
   * specified value.  This also triggers handlers for the `isComplete` binding, even if `isComplete` is already `true`.
   *
   * @returns `true` if the value was accepted or `false` if it was ignored, ex. due to a reset.
   */
  setSuccess: (value: SuccessT | undefined) => boolean;

  /**
   * Call to set the waitable's error.
   *
   * Calling `setFailure` more than once and/or after a `setSuccess` call is allowed and will make the waitable fail with the specified
   * error.  This also triggers handlers for the `isComplete` binding, even if `isComplete` is already `true`.
   *
   * @returns `true` if the value was accepted or `false` if it was ignored, ex. due to a reset.
   */
  setFailure: (value: FailureT) => boolean;

  /**
   * Determines if the waitable was reset after the `setSuccess` or `setFailure` were created.  If it was reset, calls to these functions
   * will be ignored.  However, proactively checking can help some asynchronous functions avoid unnecessary work, even if they're already
   * partially complete.
   *
   * @returns `true` if the waitable was reset after these functions were created
   */
  wasReset: () => boolean;
}) => TypeOrPromisedType<void>;

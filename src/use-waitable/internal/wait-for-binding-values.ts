import type { ReadonlyBinding, TypeOrDeferredType } from 'react-bindings';
import { resolveTypeOrDeferredType, waitForCondition } from 'react-bindings';

import type { WaitResult } from '../../waitable/types/wait';

/**
 * With respect to a waitable, waits for one of the following:
 * - the value binding to have a defined value
 * - the error binding to have a defined value (unless `continueWaitingOnFailure` is `true`)
 * - a reset (unless `continueWaitingOnReset` is true, which it is by default)
 * - timeout (if `timeoutMSec` is set)
 *
 * @returns `'success'` if the value binding has a defined value, `'failure'` if the error binding has a defined value, `'reset'` if the
 * waitable was reset, or `'timeout'` if no value was defined before the allowed time elapsed.
 */
export const waitForBindingValues = async ({
  continueWaitingOnFailure = false,
  continueWaitingOnReset = true,
  error,
  resetCount,
  timeoutMSec,
  value
}: {
  continueWaitingOnFailure?: TypeOrDeferredType<boolean>;
  continueWaitingOnReset?: TypeOrDeferredType<boolean>;
  error: ReadonlyBinding;
  resetCount: ReadonlyBinding;
  timeoutMSec?: number;
  value: ReadonlyBinding;
}): Promise<WaitResult> => {
  let stopReason: 'failure' | 'reset' = 'failure';
  const initialResetCountChangeUid = resetCount.getChangeUid();
  const waited = await waitForCondition(
    { error, resetCount, value },
    {
      checkCondition: ({ error, value }) => {
        if (value !== undefined) {
          return 'satisfied';
        }

        if (error !== undefined && !resolveTypeOrDeferredType(continueWaitingOnFailure)) {
          stopReason = 'failure';
          return 'stop';
        }

        if (resetCount.getChangeUid() !== initialResetCountChangeUid && !resolveTypeOrDeferredType(continueWaitingOnReset)) {
          stopReason = 'reset';
          return 'stop';
        }

        return 'continue';
      },
      timeoutMSec
    }
  );

  switch (waited) {
    case 'satisfied':
      return 'success';
    case 'timeout':
      return 'timeout';
    case 'stopped':
      return stopReason;
  }
};

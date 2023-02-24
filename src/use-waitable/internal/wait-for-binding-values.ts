import type { ReadonlyBinding, TypeOrDeferredType } from 'react-bindings';
import { resolveTypeOrDeferredType } from 'react-bindings';

import type { WaitResult } from '../../waitable/types/wait';

/**
 * With respect to a waitable, waits for one of the following:
 * - the value binding to have a defined value
 * - the error binding to have a defined value
 * - a reset
 * - timeout (if `timeoutMSec` is set)
 *
 * @returns `'success'` if the value binding has a defined value, `'failure'` if the error binding has a defined value, `'reset'` if the
 * waitable was reset, or `'timeout'` if no value was defined before the allowed time elapsed.
 */
export const waitForBindingValues = ({
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
}) =>
  new Promise<WaitResult>((resolve) => {
    if (value.get() !== undefined) {
      return resolve('success');
    } else if (error.get() !== undefined) {
      return resolve('failure');
    } else {
      let lastTimeout: ReturnType<typeof setTimeout> | undefined;
      const removers: Array<() => void> = [];
      const clearRemoversAndTimeout = () => {
        for (const remover of removers) {
          remover();
        }
        removers.length = 0;

        if (lastTimeout !== undefined) {
          clearTimeout(lastTimeout);
          lastTimeout = undefined;
        }
      };

      removers.push(
        resetCount.addChangeListener(() => {
          if (!resolveTypeOrDeferredType(continueWaitingOnReset)) {
            clearRemoversAndTimeout();
            resolve('reset');
          }
        })
      );

      removers.push(
        value.addChangeListener(() => {
          clearRemoversAndTimeout();
          resolve('success');
        })
      );

      removers.push(
        error.addChangeListener(() => {
          if (!resolveTypeOrDeferredType(continueWaitingOnFailure)) {
            clearRemoversAndTimeout();
            resolve('failure');
          }
        })
      );

      if (timeoutMSec !== undefined) {
        lastTimeout = setTimeout(() => {
          clearRemoversAndTimeout();
          resolve('timeout');
        }, timeoutMSec);
      }
    }
  });

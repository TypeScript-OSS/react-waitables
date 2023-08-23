import isPromise from 'is-promise';
import type { MutableRefObject } from 'react';
import type { Binding, ReadonlyBinding } from 'react-bindings';
import { getLogger } from 'react-bindings';

import type { UseWaitableOnFailureCallback, UseWaitableOnSuccessCallback } from '../types/args';
import type { WaitablePrimaryFunction } from '../types/primary-function';

/**
 * Updates the error or value bindings for a waitable by running the primary function.
 *
 * This function:
 *
 * - marks the waitable as having been run
 * - marks the waitable as busy
 * - runs the primary function, with callbacks that directly affect the waitable's value and error bindings
 * - marks the waitable as no longer busy
 *
 * If an uncaught error is thrown, the value and error bindings are unaffected but the waitable's busy state will be cleared
 */
export const updateWaitableBindingsWithPrimaryFunction = <SuccessT, FailureT>({
  id,
  primaryFunc,
  isBusy,
  error,
  value,
  alreadyRanFunc,
  resetCount,
  onSuccess,
  onFailure
}: {
  id: string;
  isBusy: Binding<boolean>;
  primaryFunc: WaitablePrimaryFunction<SuccessT, FailureT>;
  error: Binding<FailureT | undefined>;
  value: Binding<SuccessT | undefined>;
  alreadyRanFunc: MutableRefObject<boolean>;
  resetCount: ReadonlyBinding<number>;
  onSuccess: UseWaitableOnSuccessCallback<SuccessT> | undefined;
  onFailure: UseWaitableOnFailureCallback<FailureT> | undefined;
}) => {
  alreadyRanFunc.current = true;

  isBusy.set(true);

  const initialResetCount = resetCount.get();

  try {
    const possiblePromise = primaryFunc({
      setSuccess: (successValue: SuccessT | undefined) => {
        if (resetCount.get() !== initialResetCount) {
          return false; // Ignoring this result since there was a reset after this function was called
        }

        value.set(successValue);
        if (error.get() !== undefined) {
          error.set(undefined);
        }
        isBusy.set(false);

        onSuccess?.(successValue);

        return true;
      },
      setFailure: (errorValue: FailureT) => {
        if (resetCount.get() !== initialResetCount) {
          return false; // Ignoring this result since there was a reset after this function was called
        }

        error.set(errorValue);
        isBusy.set(false);

        onFailure?.(errorValue);

        return true;
      },
      wasReset: () => resetCount.get() !== initialResetCount
    });

    if (isPromise(possiblePromise)) {
      return possiblePromise.catch((e) => {
        getLogger().error?.(`${id} failed with an uncaught exception`, e);
        isBusy.set(false);
      });
    } else {
      return possiblePromise;
    }
  } catch (e) {
    getLogger().error?.(`${id} failed with an uncaught exception`, e);
    isBusy.set(false);
  }
};

import isPromise from 'is-promise';
import type { MutableRefObject } from 'react';
import type { Binding, ReadonlyBinding } from 'react-bindings';

import type { TypeOrPromisedType } from '../../resolveable/types';
import type { UseWaitableOnSuccessCallback } from '../types/args';
import type { WaitablePrimaryFunction } from '../types/primary-function';

/**
 * Updates the error or value bindings for a waitable in the case where the waitable's primary function is also used as its default value
 * producer.
 *
 * This function:
 *
 * - marks the waitable as having been run
 * - marks the waitable as busy
 * - set error to undefined
 * - runs the primary function
 * - if the waitable hasn't otherwise been updated before the value was produced, the waitable's value is updated with the result
 * - marks the waitable as no longer busy
 *
 * If there's an error, the waitable is soft reset so the primary function can be rerun.
 */
export const updateWaitableBindingsWithPrimaryFunctionForDefaultValue = <SuccessT, FailureT>({
  primaryFunc,
  isBusy,
  error,
  value,
  alreadyRanFunc,
  resetCount,
  softReset,
  onSuccess
}: {
  isBusy: Binding<boolean>;
  primaryFunc: WaitablePrimaryFunction<SuccessT, FailureT>;
  error: Binding<FailureT | undefined>;
  value: Binding<SuccessT | undefined>;
  alreadyRanFunc: MutableRefObject<boolean>;
  resetCount: ReadonlyBinding<number>;
  softReset: () => void;
  onSuccess: UseWaitableOnSuccessCallback<SuccessT> | undefined;
}): TypeOrPromisedType<void> => {
  alreadyRanFunc.current = true;

  isBusy.set(true);

  if (error.get() !== undefined) {
    error.set(undefined);
  }

  const valueChangeUid = value.getChangeUid();
  const errorChangeUid = error.getChangeUid();

  const initialResetCount = resetCount.get();

  try {
    let alreadyResolved = false;
    const possiblePromise = primaryFunc({
      setSuccess: (successValue: SuccessT | undefined) => {
        if (resetCount.get() !== initialResetCount) {
          return false; // Ignoring this result since there was a reset after this function was called
        }

        onSuccess?.(successValue);

        alreadyResolved = true;

        value.set(successValue);
        if (error.get() !== undefined) {
          error.set(undefined);
        }
        isBusy.set(false);

        return true;
      },
      setFailure: () => {
        if (resetCount.get() !== initialResetCount) {
          return false; // Ignoring this result since there was a reset after this function was called
        }

        alreadyResolved = true;
        softReset();

        return true;
      },
      wasReset: () => resetCount.get() !== initialResetCount
    });

    if (isPromise(possiblePromise)) {
      // If defaultValue returns a promise, setting value to undefined until the default value is resolved.  Otherwise, we can avoid the
      // extra set call for synchronous defaultValue functions.
      //
      // If the waitable was already updated before the default value was generated, throw the default away.
      if (
        !alreadyResolved &&
        valueChangeUid === value.getChangeUid() &&
        errorChangeUid === error.getChangeUid() &&
        value.get() !== undefined
      ) {
        value.set(undefined);
      }

      return possiblePromise.catch(softReset);
    }
  } catch (e) {
    softReset();
  }
};

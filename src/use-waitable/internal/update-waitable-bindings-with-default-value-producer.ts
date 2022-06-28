import isPromise from 'is-promise';
import type { Binding } from 'react-bindings';

import { makeValueThenDo } from '../../internal-utils/make-value-then-do';
import type { TypeOrPromisedType } from '../../resolveable/types';
import type { UseWaitableDefaultValueProducer } from '../types/args';

/**
 * Updates the error or value bindings for a waitable given a default value producing function (or undefined).
 *
 * If no default value function is provided, this function:
 *
 * - sets error and value to undefined and stops
 *
 * If a default value function is provided, this function:
 *
 * - set error to undefined
 * - runs the default value producer function
 * - if the waitable hasn't otherwise been updated before the default result was produced, the waitable's value is updated with the result
 *
 * Errors in default value producer functions are ignored.
 */
export const updateWaitableBindingsWithDefaultValueProducer = <SuccessT, FailureT>({
  areValuesEqual,
  defaultValue,
  error,
  value
}: {
  areValuesEqual: (a: any, b: any) => boolean;
  defaultValue: UseWaitableDefaultValueProducer<SuccessT> | undefined;
  error: Binding<FailureT | undefined>;
  value: Binding<SuccessT | undefined>;
}): TypeOrPromisedType<void> => {
  if (error.get() !== undefined) {
    error.set(undefined);
  }

  if (defaultValue === undefined) {
    if (value.get() !== undefined) {
      value.set(undefined);
    }

    return;
  }

  const valueChangeUid = value.getChangeUid();
  const errorChangeUid = error.getChangeUid();

  try {
    let alreadyRanThenPart = false;
    const possiblePromise = makeValueThenDo(defaultValue, (resolvedDefaultValue) => {
      alreadyRanThenPart = true;

      // If the waitable was already updated before the default value was generated, throw the default away
      if (valueChangeUid !== value.getChangeUid() || errorChangeUid !== error.getChangeUid()) {
        return;
      }

      if (!areValuesEqual(value.get(), resolvedDefaultValue)) {
        value.set(resolvedDefaultValue);
      }
    });

    if (isPromise(possiblePromise)) {
      // If defaultValue returns a promise, setting value to undefined until the default value is resolved.  Otherwise, we can avoid the
      // extra set call for synchronous defaultValue functions.
      //
      // If the waitable was already updated before the default value was generated, throw the default away.
      if (
        !alreadyRanThenPart &&
        valueChangeUid === value.getChangeUid() &&
        errorChangeUid === error.getChangeUid() &&
        value.get() !== undefined
      ) {
        value.set(undefined);
      }

      // Ignoring errors caused by defaultValue functions -- we want to be able to call defaultValue functions even while locked
      return possiblePromise.catch(() => {});
    }
  } catch (e) {
    // Ignoring errors caused by defaultValue functions -- we want to be able to call defaultValue functions even while locked
  }
};

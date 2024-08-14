import { makeBinding, makeConstBinding, makeTransientDerivedBinding, useStableValue } from 'react-bindings';

import { waitForBindingValues } from '../../use-waitable/internal/wait-for-binding-values.js';
import type { WaitOptions } from '../../waitable/types/wait.js';
import type { Waitable } from '../../waitable/types/waitable.js';
import type { WrappedResult } from '../../waitable/types/wrapped-result.js';

export const makeConstWaitable = <SuccessT, FailureT = any>({
  id,
  value: successValue,
  error: errorValue
}: {
  id: string;
  value?: SuccessT;
  error?: FailureT;
}): Waitable<SuccessT, FailureT> => {
  const force = makeBinding<WrappedResult<SuccessT, FailureT> | undefined>(() => undefined, { id: 'force' });

  const error = makeTransientDerivedBinding(
    force,
    (force): FailureT | undefined => (force === undefined ? errorValue : force.ok ? undefined : force.value),
    { id: 'error' }
  );
  const value = makeTransientDerivedBinding(
    force,
    (force): SuccessT | undefined => (force === undefined ? successValue : force.ok ? force.value : undefined),
    { id: 'value' }
  );

  /**
   * If true, either the `value` or `error` binding have defined values.
   *
   * This is a transient derived binding because we want it to have an up-to-date value, even when unmounted (since default value updates to
   * value, for example, can happen asynchronously while unmounted).
   */
  const isComplete = makeTransientDerivedBinding(
    { error, value },
    ({ error, value }): boolean => value !== undefined || error !== undefined,
    { id: `${id}_isComplete` }
  );

  const resetCount = makeConstBinding(0, { id: 'resetCount' });
  const isBusy = makeConstBinding(false, { id: 'isBusy' });
  const isLocked = makeConstBinding(false, { id: 'isLocked' });
  const isLockedWithoutValue = makeConstBinding(false, { id: 'isLockedWithoutValue' });

  return {
    id,
    error,
    value,
    isBusy,
    isComplete,
    isLocked,
    isLockedWithoutValue,
    isWaitable: true,
    reset: () => {},
    force,
    wait: async (options?: WaitOptions) => waitForBindingValues({ error, resetCount, value, ...options })
  };
};

export const useConstWaitable = <SuccessT, FailureT = any>(args: {
  id: string;
  value?: SuccessT;
  error?: FailureT;
}): Waitable<SuccessT, FailureT> => useStableValue(makeConstWaitable<SuccessT, FailureT>(args));

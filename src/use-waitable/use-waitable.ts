import { useMemo, useRef } from 'react';
import type { EmptyObject, ReadonlyBinding } from 'react-bindings';
import {
  areEqual,
  pickLimiterOptions,
  useBinding,
  useBindingEffect,
  useCallbackRef,
  useDerivedBinding,
  useLimiter,
  useTransientDerivedBinding
} from 'react-bindings';

import { isSpecialLoggingEnabledFor } from '../config/logging.js';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref.js';
import { normalizeAsArray } from '../internal-utils/array-like.js';
import { getTypedKeys } from '../internal-utils/get-typed-keys.js';
import type { ResetType } from '../waitable/types/reset';
import type { Waitable } from '../waitable/types/waitable';
import type { WrappedResult } from '../waitable/types/wrapped-result.js';
import { areAnyBindingsFalsey } from './internal/are-any-bindings-falsey.js';
import { areAnyBindingsTruthy } from './internal/are-any-bindings-truthy.js';
import { doSpecialLoggingForLockedWaitable, doSpecialLoggingForUnlockedWaitable } from './internal/special-logging.js';
import { updateWaitableBindingsWithDefaultValueProducer } from './internal/update-waitable-bindings-with-default-value-producer.js';
import { updateWaitableBindingsWithPrimaryFunction } from './internal/update-waitable-bindings-with-primary-function.js';
import { updateWaitableBindingsWithPrimaryFunctionForDefaultValue } from './internal/update-waitable-bindings-with-primary-function-for-default-value.js';
import { waitForBindingValues } from './internal/wait-for-binding-values.js';
import type { UseWaitableArgs } from './types/args';
import type { WaitablePrimaryFunction } from './types/primary-function';

const emptyBindingsArray = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;

/**
 * Creates a waitable associated with a primary function that is given responsibility for updating the success and/or failure states of the
 * waitable.
 *
 * The primary function receives callbacks for setting the success and failure states of the waitable.  These can be called any number of
 * times.  However, the primary function itself will only be called once if a reset isn't issued on the waitable.  The waitable is
 * considered busy until the function itself is complete -- though it's allowed that the `setSuccess` and `setFailure` functions can be
 * called even after the primary function is complete.  If a reset occurs, any calls to previously created `setSuccess`/`setFailure`
 * callbacks are ignored.
 *
 * If a primary function throws, the waitable will no longer be busy, but the state won't otherwise change and the primary function won't
 * automatically be rerun.
 *
 * During default value generation, if an error occurs, either thrown or via `setFailure` if using `defaultValue='use-primary-function'` or
 * `defaultValue='use-primary-function-if-unlocked'`, `reset('soft')` is automatically called so the primary function can be run again as
 * applicable.
 */
export const useWaitable = <SuccessT, FailureT = any, ExtraFieldsT extends object = EmptyObject>(
  primaryFunc: WaitablePrimaryFunction<SuccessT, FailureT>,
  args: UseWaitableArgs<SuccessT, FailureT, ExtraFieldsT>
): Waitable<SuccessT, FailureT> & ExtraFieldsT => {
  const {
    id,
    deps,
    addFields,
    areErrorsEqual = areEqual,
    detectErrorChanges = true,
    areValuesEqual = areEqual,
    detectValueChanges = true,
    lockedUntil: lockedUntilBindings,
    lockedWhile: lockedWhileBindings,
    hardResetBindings,
    softResetBindings,
    defaultValue,
    onFailure,
    onReset,
    onSuccess
  } = args;

  const limiterOptions = pickLimiterOptions(args);

  const isMounted = useIsMountedRef();

  /** The success value store */
  const value = useBinding<SuccessT | undefined>(() => undefined, {
    id: `${id}_value`,
    areEqual: areValuesEqual,
    detectChanges: detectValueChanges
  });
  /** The error value store */
  const error = useBinding<FailureT | undefined>(() => undefined, {
    id: `${id}_error`,
    areEqual: areErrorsEqual,
    detectChanges: detectErrorChanges
  });

  const force = useBinding<WrappedResult<SuccessT, FailureT> | undefined>(() => undefined, { id: `${id}_force` });
  useBindingEffect(
    force,
    (force) => {
      if (force === undefined) {
        reset('hard');
      } else {
        updateWaitableBindingsWithPrimaryFunction({
          id,
          primaryFunc: ({ setSuccess, setFailure }) => {
            if (force.ok) {
              setSuccess(force.value);
            } else {
              setFailure(force.value);
            }
          },
          isBusy,
          error,
          value,
          alreadyRanFunc,
          resetCount,
          onFailure,
          onSuccess
        });
      }
    },
    { limitType: 'none' }
  );

  /** If true, the primary function has already been started and won't run again */
  const alreadyRanFunc = useRef(false);
  /** If true, the waitable is busy running the primary function and hasn't received at least the initial result */
  const isBusy = useBinding(() => false, { id: 'isBusy', detectChanges: true });

  /**
   * If true, either the `value` or `error` binding have defined values.
   *
   * This is a transient derived binding because we want it to have an up-to-date value, even when unmounted (since default value updates to
   * value, for example, can happen asynchronously while unmounted).
   */
  const isComplete = useTransientDerivedBinding(
    { error, value },
    ({ error, value }): boolean => value !== undefined || error !== undefined,
    { id: `${id}_isComplete` }
  );

  /** If true, the last time the primary function was attempted to be run, this waitable was locked */
  const lastExecAttemptWasLocked = useRef(false);
  /** If any of these bindings are falsey, this waitable is locked */
  const lockedUntil = lockedUntilBindings !== undefined ? normalizeAsArray(lockedUntilBindings) : emptyBindingsArray;
  /** If any of these bindings are true, this waitable is locked */
  const lockedWhile = lockedWhileBindings !== undefined ? normalizeAsArray(lockedWhileBindings) : emptyBindingsArray;

  /** Incremented on each reset */
  const resetCount = useBinding<number>(() => 0, { id: 'resetCount', detectChanges: true });

  /** The limiter used for scheduling the execution of the primary function */
  const limiter = useLimiter({ id, cancelOnUnmount: true, ...limiterOptions });
  const scheduleIfNeeded = useCallbackRef(() => limiter.limit(execPrimaryFuncIfNeeded));

  /**
   * Updates either using the primary function or the specified default value producer function.
   *
   * If no default value setting is given, this just sets the `error` and `value` bindings to undefined.
   */
  const updateWithDefaultValue = useCallbackRef(() => {
    if (defaultValue === 'use-primary-function') {
      return updateWaitableBindingsWithPrimaryFunctionForDefaultValue({
        primaryFunc,
        isBusy,
        error,
        value,
        alreadyRanFunc,
        resetCount,
        softReset,
        onSuccess
      });
    } else if (defaultValue === 'use-primary-function-if-unlocked') {
      if (!isLocked.get()) {
        return updateWaitableBindingsWithPrimaryFunctionForDefaultValue({
          primaryFunc,
          isBusy,
          error,
          value,
          alreadyRanFunc,
          resetCount,
          softReset,
          onSuccess
        });
      } else {
        return updateWaitableBindingsWithDefaultValueProducer({ areValuesEqual, defaultValue: undefined, error, value });
      }
    } else {
      return updateWaitableBindingsWithDefaultValueProducer({ areValuesEqual, defaultValue, error, value });
    }
  });

  const reset: Waitable<SuccessT, FailureT>['reset'] = useCallbackRef((resetType: ResetType) => {
    alreadyRanFunc.current = false;
    isBusy.set(false);
    lastExecAttemptWasLocked.current = false;

    resetCount.set(resetCount.get() + 1);

    switch (resetType) {
      case 'hard':
        updateWithDefaultValue();
        break;
      case 'soft':
        // For soft reset, we always clear the error
        if (error.get() !== undefined) {
          error.set(undefined);
        }
        break;
    }

    onReset?.(resetType);

    scheduleIfNeeded();
  });

  const hardReset = useCallbackRef(() => reset('hard'));
  const softReset = useCallbackRef(() => reset('soft'));

  const wait: Waitable<SuccessT, FailureT>['wait'] = useCallbackRef((options) =>
    waitForBindingValues({ error, resetCount, value, ...options })
  );

  /** If true, this waitable is locked */
  const isLocked = useDerivedBinding(
    [...lockedUntil, ...lockedWhile],
    (): boolean => areAnyBindingsFalsey(lockedUntil) || areAnyBindingsTruthy(lockedWhile),
    { id: `${id}_locked`, limitType: 'none' }
  );

  /** If true, this waitable is locked and it doesn't already have a value */
  const isLockedWithoutValue = useDerivedBinding({ isLocked, value }, ({ isLocked, value }): boolean => isLocked && value === undefined, {
    id: `${id}_isLockedWithoutValue`,
    limitType: 'none',
    deps
  });

  /**
   * Checks if the primary function is ready to be executed and then runs it if needed.
   *
   * The primary function can be run if all of:
   *
   * - is mounted (can be ignored via the `ignoreIsMounted` flag)
   * - hasn't already been run
   * - isn't locked
   */
  const execPrimaryFuncIfNeeded = useCallbackRef(() => {
    if (alreadyRanFunc.current || !(isMounted.current ?? false)) {
      return;
    }

    if (isLocked.get()) {
      if (!lastExecAttemptWasLocked.current && isSpecialLoggingEnabledFor('waitable-locking-warnings')) {
        doSpecialLoggingForLockedWaitable({ id, lockedUntil, lockedWhile });
      }
      lastExecAttemptWasLocked.current = true;

      return;
    }

    if (lastExecAttemptWasLocked.current && isSpecialLoggingEnabledFor('waitable-locking-warnings')) {
      doSpecialLoggingForUnlockedWaitable({ id, lockedUntil, lockedWhile });
    }
    lastExecAttemptWasLocked.current = false;

    updateWaitableBindingsWithPrimaryFunction({
      id,
      primaryFunc,
      isBusy,
      error,
      value,
      alreadyRanFunc,
      resetCount,
      onFailure,
      onSuccess
    });
  });

  // If becomes unlocked, schedule
  useBindingEffect(
    { isLocked },
    ({ isLocked }) => {
      if (!isLocked) {
        scheduleIfNeeded();
      }
    },
    { triggerOnMount: true }
  );

  // Listening for changes to the hard and soft reset bindings.  Deps changes are also treated like hard bindings resets
  useBindingEffect(hardResetBindings, hardReset, { id: `${id}_hardResetBindings`, deps, limitType: 'none' });
  useBindingEffect(softResetBindings, softReset, { id: `${id}_softResetBindings`, limitType: 'none' });

  // If this is the first render, initializing the default value
  const isFirstRender = useRef(true);
  if (isFirstRender.current) {
    isFirstRender.current = false;

    updateWithDefaultValue();
  }

  // If already mounted, scheduling right away if needed
  if (isMounted.current ?? false) {
    scheduleIfNeeded();
  }

  const output = useMemo<Waitable<SuccessT, FailureT>>(
    (): Waitable<SuccessT, FailureT> => ({
      isWaitable: true,
      id,
      value,
      error,
      force,
      isBusy,
      isComplete,
      isLocked,
      isLockedWithoutValue,
      reset,
      wait
    }),
    [error, force, id, isBusy, isComplete, isLocked, isLockedWithoutValue, reset, value, wait]
  ) as Waitable<SuccessT, FailureT> & ExtraFieldsT;
  const extraFields = addFields?.(output);
  if (extraFields !== undefined) {
    for (const key of getTypedKeys(extraFields)) {
      output[key] = extraFields[key] as (typeof output)[typeof key];
    }
  }

  return output;
};

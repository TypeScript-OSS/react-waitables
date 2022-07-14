import type { DependencyList } from 'react';
import type { BindingArrayDependencies, EmptyObject, LimiterOptions, ReadonlyBinding } from 'react-bindings';

import type { TypeOrPromisedType } from '../../resolveable/types';
import type { ResetType } from '../../waitable/types/reset';
import type { Waitable } from '../../waitable/types/waitable';

export type UseWaitableDefaultValueProducer<SuccessT> = () => TypeOrPromisedType<SuccessT | undefined>;

export type UseWaitableOnResetCallback = (resetType: ResetType) => void;

export type UseWaitableOnSuccessCallback<SuccessT> = (value: SuccessT | undefined) => void;

export type UseWaitableOnFailureCallback<FailureT> = (value: FailureT) => void;

export interface UseWaitableArgs<SuccessT, FailureT = any, ExtraFieldsT = EmptyObject> extends LimiterOptions {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;

  /** On a rerender, deps changes are treated like hard reset bindings changes. */
  deps?: DependencyList;

  /** Use to support injecting additional fields into bindings */
  addFields?: (thisWaitable: Waitable<SuccessT, FailureT>) => ExtraFieldsT;

  /**
   * If specified, overrides the function used to compare error values.
   *
   * @see react-bindings
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using react-bindings `setAreEqual`
   */
  areErrorsEqual?: (a: any, b: any) => boolean;
  /**
   * - If `true` – `areErrorsEqual` is used to compare the old and new error values.  If the values are equal, the error binding's
   * underlying value won't be changed.
   * - If `false` – old and new values aren't compared and the error binding's underlying value will always be updated.
   *
   * @defaultValue `true`
   */
  detectErrorChanges?: boolean;

  /**
   * If specified, overrides the function used to compare values.
   *
   * @see react-bindings
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using react-bindings `setAreEqual`
   */
  areValuesEqual?: (a: any, b: any) => boolean;
  /**
   * - If `true` – `areErrorsEqual` is used to compare the old and new values.  If the values are equal, the value binding's
   * underlying value won't be changed.
   * - If `false` – old and new values aren't compared and the value binding's underlying value will always be updated.
   *
   * @defaultValue `true`
   */
  detectValueChanges?: boolean;

  /**
   * If specified and the values of any of the specified bindings are not truthy, the waitable is locked and the primary function cannot be
   * run yet
   */
  lockedUntil?: ReadonlyBinding | BindingArrayDependencies;
  /**
   * If specified and the values of any of the specified bindings are truthy, the waitable is locked and the primary function cannot be run
   * yet
   */
  lockedWhile?: ReadonlyBinding | BindingArrayDependencies;

  /** If any of these bindings change, the waitable will be hard reset */
  hardResetBindings?: ReadonlyBinding | BindingArrayDependencies;
  /** If any of these bindings change, the waitable will be soft reset */
  softResetBindings?: ReadonlyBinding | BindingArrayDependencies;

  /**
   * This can be used to generate a default value, which will be used to initialize the value and whenever this waitable is hard reset.  You
   * may alternatively, specify `'use-primary-function'`, in which case the primary function will be called immediately on initialization or
   * reset.
   */
  defaultValue?: UseWaitableDefaultValueProducer<SuccessT> | 'use-primary-function';

  /**
   * Called each time `setFailure` is called (except if the call to `setFailure` is ignored, ex. due to a reset or when an error occurs when
   * computing a default value)
   */
  onFailure?: UseWaitableOnFailureCallback<FailureT>;
  /** Called each time this waitable is reset */
  onReset?: UseWaitableOnResetCallback;
  /** Called each time `setSuccess` is called (except if the call to `setSuccess` is ignored, ex. due to a reset) */
  onSuccess?: UseWaitableOnSuccessCallback<SuccessT>;
}

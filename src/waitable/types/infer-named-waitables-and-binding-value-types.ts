import type { InferBindingGetType, ReadonlyBinding } from 'react-bindings';

import type { InferWaitableSuccessType } from './inference';
import type { Waitable } from './waitable';

/** Extracts the value types from waitables and bindings */
export type InferRequiredNamedWaitablesAndBindingValueTypes<
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined>
> = {
  [KeyT in keyof NamedDependenciesT]: NamedDependenciesT[KeyT] extends Waitable<any>
    ? InferWaitableSuccessType<NamedDependenciesT[KeyT]>
    : NamedDependenciesT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedDependenciesT[KeyT]>
    : NamedDependenciesT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedDependenciesT[KeyT]> | undefined
    : NamedDependenciesT[KeyT];
};

/** Extracts the value types from waitables and bindings */
export type InferOptionalNamedWaitablesAndBindingValueTypes<
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined>
> = {
  [KeyT in keyof NamedDependenciesT]: NamedDependenciesT[KeyT] extends Waitable<any>
    ? InferWaitableSuccessType<NamedDependenciesT[KeyT]> | undefined
    : NamedDependenciesT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedDependenciesT[KeyT]>
    : NamedDependenciesT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedDependenciesT[KeyT]> | undefined
    : NamedDependenciesT[KeyT];
};

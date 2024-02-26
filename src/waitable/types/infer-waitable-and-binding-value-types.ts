/* eslint-disable prettier/prettier */
import type { InferBindingGetType, ReadonlyBinding } from 'react-bindings';

import type {
  InferOptionalNamedWaitablesAndBindingValueTypes,
  InferRequiredNamedWaitablesAndBindingValueTypes
} from './infer-named-waitables-and-binding-value-types';
import type {
  InferOptionalWaitableAndBindingArrayValueTypes,
  InferRequiredWaitableAndBindingArrayValueTypes
} from './infer-waitable-and-binding-array-value-types';
import type { InferWaitableSuccessType } from './inference';
import type { Waitable } from './waitable';
import type { NamedWaitableDependencies, WaitableArrayDependencies, WaitableDependencies } from './waitable-dependencies';

/** Infers the values of either a single binding, bindings in an array or tuple, or a record with binding values */
export type InferRequiredWaitableAndBindingValueTypes<DependenciesT extends WaitableDependencies> = DependenciesT extends Waitable<any>
  ? InferWaitableSuccessType<DependenciesT>
  : DependenciesT extends Waitable<any> | undefined
  ? InferWaitableSuccessType<DependenciesT> | undefined
  : DependenciesT extends ReadonlyBinding
  ? InferBindingGetType<DependenciesT>
  : DependenciesT extends NamedWaitableDependencies
  ? InferRequiredNamedWaitablesAndBindingValueTypes<DependenciesT>
  : DependenciesT extends WaitableArrayDependencies
  ? InferRequiredWaitableAndBindingArrayValueTypes<DependenciesT>
  : Record<string, never>;

/** Infers the values of either a single binding, bindings in an array or tuple, or a record with binding values */
export type InferOptionalWaitableAndBindingValueTypes<DependenciesT extends WaitableDependencies> = DependenciesT extends
  | Waitable<any>
  | undefined
  ? InferWaitableSuccessType<DependenciesT> | undefined
  : DependenciesT extends ReadonlyBinding
  ? InferBindingGetType<DependenciesT>
  : DependenciesT extends NamedWaitableDependencies
  ? InferOptionalNamedWaitablesAndBindingValueTypes<DependenciesT>
  : DependenciesT extends WaitableArrayDependencies
  ? InferOptionalWaitableAndBindingArrayValueTypes<DependenciesT>
  : Record<string, never>;

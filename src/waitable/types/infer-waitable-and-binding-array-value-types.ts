/* eslint-disable prettier/prettier */
import type { InferBindingGetType, ReadonlyBinding } from 'react-bindings';

import type { InferWaitableSuccessType } from './inference';
import type { Waitable } from './waitable';
import type { WaitableArrayDependencies } from './waitable-dependencies';

/** Infers the value types from waitable and binding arrays */
export type InferRequiredWaitableAndBindingArrayValueTypes<DependenciesT extends WaitableArrayDependencies> = {
  [KeyT in keyof DependenciesT]: DependenciesT[KeyT] extends Waitable<any>
    ? InferWaitableSuccessType<DependenciesT[KeyT]>
    : DependenciesT[KeyT] extends Waitable<any> | undefined
    ? InferWaitableSuccessType<DependenciesT[KeyT]> | undefined
    : DependenciesT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<DependenciesT[KeyT]>
    : DependenciesT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<DependenciesT[KeyT]> | undefined
    : DependenciesT[KeyT];
};

/** Infers the value types from waitable and binding arrays */
export type InferOptionalWaitableAndBindingArrayValueTypes<DependenciesT extends WaitableArrayDependencies> = {
  [KeyT in keyof DependenciesT]: DependenciesT[KeyT] extends Waitable<any> | undefined
    ? InferWaitableSuccessType<DependenciesT[KeyT]> | undefined
    : DependenciesT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<DependenciesT[KeyT]>
    : DependenciesT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<DependenciesT[KeyT]> | undefined
    : DependenciesT[KeyT];
};

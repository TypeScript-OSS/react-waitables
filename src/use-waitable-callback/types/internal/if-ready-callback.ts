import type { TypeOrPromisedType } from '../../../resolveable/types';
import type { InferRequiredWaitableAndBindingValueTypes } from '../../../waitable/types/infer-waitable-and-binding-value-types';
import type { WaitableDependencies } from '../../../waitable/types/waitable-dependencies';

export type IfReadyCallback<ArgsT extends any[], DependenciesT extends WaitableDependencies> = (
  dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
  dependencies: DependenciesT,
  ...args: ArgsT
) => TypeOrPromisedType<void>;

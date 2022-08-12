import type { TypeOrPromisedType } from '../../../resolveable/types';
import type { WaitableDependencies } from '../../../waitable/types/waitable-dependencies';

export type IfNotReadyCallback<ArgsT extends any[], DependenciesT extends WaitableDependencies> = (
  dependencies: DependenciesT,
  ...args: ArgsT
) => TypeOrPromisedType<void>;

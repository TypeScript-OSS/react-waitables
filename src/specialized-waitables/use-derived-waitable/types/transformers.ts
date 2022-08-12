import type { TypeOrPromisedType } from '../../../resolveable/types';
import type {
  InferOptionalWaitableAndBindingValueTypes,
  InferRequiredWaitableAndBindingValueTypes
} from '../../../waitable/types/infer-waitable-and-binding-value-types';
import type { WaitableDependencies } from '../../../waitable/types/waitable-dependencies';

/** A transformer that requires all waitable values to be loaded. */
export type UseDerivedWaitableRequiredValuesTransformer<SuccessT, FailureT, DependenciesT extends WaitableDependencies> = (
  dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
  dependencies: DependenciesT,
  setFailure: (failure: FailureT) => void,
  wasReset: () => boolean
) => TypeOrPromisedType<SuccessT | undefined>;

/** A transformer that doesn't require all waitable values to be loaded. */
export type UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, DependenciesT extends WaitableDependencies> = (
  dependencyValues: InferOptionalWaitableAndBindingValueTypes<DependenciesT>,
  dependencies: DependenciesT,
  setFailure: (failure: FailureT) => void,
  wasReset: () => boolean
) => TypeOrPromisedType<SuccessT | undefined>;

/**
 * Transformers that are used depending on the state of the waitables.
 *
 * The first applicable transformer is used, evaluated in the following order: `ifLoaded`, `ifError`, `ifLoading`, `ifErrorOrLoading`,
 * `always`
 */
export interface UseDerivedWaitableNamedTransformers<SuccessT, FailureT, DependenciesT extends WaitableDependencies> {
  ifLoaded?: UseDerivedWaitableRequiredValuesTransformer<SuccessT, FailureT, DependenciesT>;
  ifError?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, DependenciesT>;
  ifLoading?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, DependenciesT>;
  ifErrorOrLoading?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, DependenciesT>;
  always?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, DependenciesT>;
}

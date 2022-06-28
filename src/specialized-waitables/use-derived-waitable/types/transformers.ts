import type { ReadonlyBinding } from 'react-bindings';

import type { TypeOrPromisedType } from '../../../resolveable/types';
import type {
  ExtractOptionalNamedWaitablesAndBindingValues,
  ExtractRequiredNamedWaitablesAndBindingValues
} from '../../../waitable/types/extract-named-waitables-and-binding-values';
import type { Waitable } from '../../../waitable/types/waitable';

/** A transformer that requires all waitable values to be loaded. */
export type UseDerivedWaitableRequiredValuesTransformer<
  SuccessT,
  FailureT,
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> = (
  dependencyValues: ExtractRequiredNamedWaitablesAndBindingValues<NamedDependenciesT>,
  dependencies: NamedDependenciesT,
  setFailure: (failure: FailureT) => void
) => TypeOrPromisedType<SuccessT | undefined>;

/** A transformer that doesn't require all waitable values to be loaded. */
export type UseDerivedWaitableOptionalValuesTransformer<
  SuccessT,
  FailureT,
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> = (
  dependencyValues: ExtractOptionalNamedWaitablesAndBindingValues<NamedDependenciesT>,
  dependencies: NamedDependenciesT,
  setFailure: (failure: FailureT) => void
) => TypeOrPromisedType<SuccessT | undefined>;

/**
 * Transformers that are used depending on the state of the waitables.
 *
 * The first applicable transformer is used, evaluated in the following order: `ifLoaded`, `ifError`, `ifLoading`, `ifErrorOrLoading`,
 * `always`
 */
export interface UseDerivedWaitableNamedTransformers<
  SuccessT,
  FailureT,
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> {
  ifLoaded?: UseDerivedWaitableRequiredValuesTransformer<SuccessT, FailureT, NamedDependenciesT>;
  ifError?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, NamedDependenciesT>;
  ifLoading?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, NamedDependenciesT>;
  ifErrorOrLoading?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, NamedDependenciesT>;
  always?: UseDerivedWaitableOptionalValuesTransformer<SuccessT, FailureT, NamedDependenciesT>;
}

import type { ReactNode } from 'react';

import {
  InferOptionalWaitableAndBindingValueTypes,
  InferRequiredWaitableAndBindingValueTypes
} from '../../../waitable/types/infer-waitable-and-binding-value-types';
import type { WaitableDependencies } from '../../../waitable/types/waitable-dependencies';

/** A transformer that requires all waitable values to be loaded. */
export type WaitablesConsumerRequiredValuesTransformer<DependenciesT extends WaitableDependencies> = (
  dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
  dependencies: DependenciesT
) => ReactNode;

/** A transformer that doesn't require all waitable values to be loaded. */
export type WaitablesConsumerOptionalValuesTransformer<DependenciesT extends WaitableDependencies> = (
  dependencyValues: InferOptionalWaitableAndBindingValueTypes<DependenciesT>,
  dependencies: DependenciesT
) => ReactNode;

/**
 * Transformers that are used depending on the state of the waitables.
 *
 * The first applicable transformer is used, evaluated in the following order: `ifLoaded`, `ifError`, `ifLoading`, `ifErrorOrLoading`,
 * `always`
 */
export interface WaitablesConsumerNamedTransformers<DependenciesT extends WaitableDependencies> {
  /** All waitables have defined values */
  ifLoaded?: WaitablesConsumerRequiredValuesTransformer<DependenciesT>;
  /** At least one waitable has a defined error */
  ifError?: WaitablesConsumerOptionalValuesTransformer<DependenciesT>;
  /** At least one waitable doesn't have a defined value but no waitables have defined errors */
  ifLoading?: WaitablesConsumerOptionalValuesTransformer<DependenciesT>;
  /** At least one waitable doesn't have a defined value or at least one waitable has a defined error */
  ifErrorOrLoading?: WaitablesConsumerOptionalValuesTransformer<DependenciesT>;
  /** Always applicable */
  always?: WaitablesConsumerOptionalValuesTransformer<DependenciesT>;
}

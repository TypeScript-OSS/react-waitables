import { ReactNode } from 'react';
import type { ReadonlyBinding } from 'react-bindings';

import type {
  ExtractOptionalNamedWaitablesAndBindingValues,
  ExtractRequiredNamedWaitablesAndBindingValues,
  Waitable
} from '../../../waitable/exports';

/** A transformer that requires all waitable values to be loaded. */
export type WaitablesConsumerRequiredValuesTransformer<
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> = (dependencyValues: ExtractRequiredNamedWaitablesAndBindingValues<NamedDependenciesT>, dependencies: NamedDependenciesT) => ReactNode;

/** A transformer that doesn't require all waitable values to be loaded. */
export type WaitablesConsumerOptionalValuesTransformer<
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> = (dependencyValues: ExtractOptionalNamedWaitablesAndBindingValues<NamedDependenciesT>, dependencies: NamedDependenciesT) => ReactNode;

/**
 * Transformers that are used depending on the state of the waitables.
 *
 * The first applicable transformer is used, evaluated in the following order: `ifLoaded`, `ifError`, `ifLoading`, `ifErrorOrLoading`,
 * `always`
 */
export interface WaitablesConsumerNamedTransformers<
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>
> {
  /** All waitables have defined values */
  ifLoaded?: WaitablesConsumerRequiredValuesTransformer<NamedDependenciesT>;
  /** At least one waitable has a defined error */
  ifError?: WaitablesConsumerOptionalValuesTransformer<NamedDependenciesT>;
  /** At least one waitable doesn't have a defined value but no waitables have defined errors */
  ifLoading?: WaitablesConsumerOptionalValuesTransformer<NamedDependenciesT>;
  /** At least one waitable doesn't have a defined value or at least one waitable has a defined error */
  ifErrorOrLoading?: WaitablesConsumerOptionalValuesTransformer<NamedDependenciesT>;
  /** Always applicable */
  always?: WaitablesConsumerOptionalValuesTransformer<NamedDependenciesT>;
}

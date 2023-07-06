import type { WaitableDependencies } from '../../waitable/types/waitable-dependencies';
import type { WaitablesConsumerNamedTransformers } from './types/transformers';

export const pickWaitablesConsumerNamedTransformers = <DependenciesT extends WaitableDependencies>(
  value: WaitablesConsumerNamedTransformers<DependenciesT>
): WaitablesConsumerNamedTransformers<DependenciesT> => ({
  always: value.always,
  ifError: value.ifError,
  ifErrorOrLoading: value.ifErrorOrLoading,
  ifLoaded: value.ifLoaded,
  ifLoading: value.ifLoading
});

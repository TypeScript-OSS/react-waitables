import type { LimiterOptions } from 'react-bindings';

import type { WaitableDependencies } from '../../../waitable/types/waitable-dependencies';
import type { WaitablesConsumerNamedTransformers } from './transformers';

export type WaitablesConsumerProps<DependenciesT extends WaitableDependencies = Record<string, never>> = LimiterOptions &
  WaitablesConsumerNamedTransformers<DependenciesT> & {
    id?: string;
    dependencies?: DependenciesT;
  };

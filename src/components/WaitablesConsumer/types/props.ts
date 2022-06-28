import type { LimiterOptions, ReadonlyBinding, SingleOrArray } from 'react-bindings';

import type { Waitable } from '../../../waitable/types/waitable';
import type { WaitablesConsumerNamedTransformers } from './transformers';

export type WaitablesConsumerProps<NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined>> =
  LimiterOptions &
    WaitablesConsumerNamedTransformers<NamedDependenciesT> & {
      id?: string;
      dependencies: SingleOrArray<Waitable<any> | ReadonlyBinding | undefined> | NamedDependenciesT;
    };

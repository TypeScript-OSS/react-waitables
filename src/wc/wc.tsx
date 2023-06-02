import React from 'react';
import type { SingleOrArray } from 'react-bindings';

import type {
  WaitablesConsumerNamedTransformers,
  WaitablesConsumerOptionalValuesTransformer,
  WaitablesConsumerRequiredValuesTransformer
} from '../components/WaitablesConsumer/types/transformers';
import { WaitablesConsumer } from '../components/WaitablesConsumer/WaitablesConsumer';
import type { WaitableDependencies } from '../waitable/types/waitable-dependencies';

/** Returns a WaitablesConsumer JSX Element.  This is useful as a shorthand especially when passing WaitablesConsumer as props of other
 * components */
export const WC = <DependenciesT extends WaitableDependencies>(
  dependencies: DependenciesT,
  children: SingleOrArray<WaitablesConsumerRequiredValuesTransformer<DependenciesT> | WaitablesConsumerNamedTransformers<DependenciesT>>,
  ifLoading?: WaitablesConsumerOptionalValuesTransformer<DependenciesT>
) => (
  <WaitablesConsumer dependencies={dependencies} ifLoading={ifLoading}>
    {children}
  </WaitablesConsumer>
);

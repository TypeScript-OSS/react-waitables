import React, { ReactNode } from 'react';
import { BindingsConsumer, EmptyObject, SingleOrArray } from 'react-bindings';

import { getDefaultWaitablesConsumerIfErrorTransformer } from '../../config/waitable-consumer-if-error-transformer';
import { useCallbackRef } from '../../internal-hooks/use-callback-ref';
import { normalizeAsArray } from '../../internal-utils/array-like';
import { useDerivedWaitable } from '../../specialized-waitables/use-derived-waitable/use-derived-waitable';
import type { Waitable } from '../../waitable/types/waitable';
import type { WaitableDependencies } from '../../waitable/types/waitable-dependencies';
import type { WaitablesConsumerProps } from './types/props';
import type { WaitablesConsumerNamedTransformers, WaitablesConsumerRequiredValuesTransformer } from './types/transformers';

const emptyDependencies = Object.freeze({} as EmptyObject);

/**
 * A component that is rerendered based on input waitable and binding changes.
 *
 * The general usage pattern is something like:
 *
 * ```
 * <WaitablesConsumer dependencies={{someWaitable, someBinding}} ifLoading={() => 'Loading…'}>
 *   {({someWaitable, someBinding}) => <Typography>{someWaitable} - {someBinding}</Typography>}
 * <WaitablesConsumer>
 * ```
 *
 * Transformers may be passed as props or as children.  The children may be a single transformer or an array, in which case the first
 * applicable transformer is used.  Transformers passed as children take precedence over those passed as props.
 *
 * An unnamed transformer is the same as `{ ifLoaded: … }`.
 *
 * Named transformer meanings:
 * - `'ifLoaded'` - All of the waitables have defined values
 * - `'ifError'` - At least one waitable has a defined error
 * - `'ifLoading'` - At least one waitable has an undefined value but no waitables have defined errors
 * - `'ifErrorOrLoading'` - At least one waitable has an undefined value
 * - `'always'` - Always applicable
 *
 * In addition to the specified transformers, a default `ifError` transformer is appended as the last fallback option, configurable using
 * `setDefaultWaitablesConsumerIfErrorTransformer`, most useful for displaying error indicators when more precise handling isn't required.
 *
 * If no transformers are applicable, nothing will be rendered.
 */
export const WaitablesConsumer = <DependenciesT extends WaitableDependencies = Record<string, never>>({
  children,
  id = 'waitable-consumer',
  dependencies,
  // WaitablesConsumerNamedTransformers
  always,
  ifError,
  ifErrorOrLoading,
  ifLoaded,
  ifLoading,
  // LimiterOptions
  limitMSec,
  limitMode,
  limitType,
  priority,
  queue
}: WaitablesConsumerProps<DependenciesT> & {
  children: SingleOrArray<WaitablesConsumerRequiredValuesTransformer<DependenciesT> | WaitablesConsumerNamedTransformers<DependenciesT>>;
}) => {
  const limiterOptions = { limitMSec, limitMode, limitType, priority, queue };

  const propsBasedTransformers: WaitablesConsumerNamedTransformers<DependenciesT> = {
    always,
    ifError,
    ifErrorOrLoading,
    ifLoaded,
    ifLoading
  };

  const ifErrorTransformer = useCallbackRef(
    (): ReactNode => getDefaultWaitablesConsumerIfErrorTransformer()?.(dependencies ?? (emptyDependencies as DependenciesT), node) ?? null
  );

  const combinedTransformers = [...normalizeAsArray(children), propsBasedTransformers, { ifError: ifErrorTransformer }];

  const node: Waitable<ReactNode> = useDerivedWaitable(dependencies, combinedTransformers, {
    id,
    priority,
    queue
  });

  return (
    <BindingsConsumer bindings={{ node: node.value }} {...limiterOptions}>
      {({ node }) => node}
    </BindingsConsumer>
  );
};

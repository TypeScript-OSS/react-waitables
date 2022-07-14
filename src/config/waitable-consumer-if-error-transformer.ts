import type { ReactNode } from 'react';

import type { Waitable } from '../waitable/types/waitable';
import type { WaitableDependencies } from '../waitable/types/waitable-dependencies';

type IfErrorTransformer = (dependencies: WaitableDependencies, node: Waitable<ReactNode>) => ReactNode;

let globalDefaultWaitablesConsumerIfErrorTransformer: IfErrorTransformer | undefined;

/** Gets the default error case transformer to use with `WaitablesConsumer` */
export const getDefaultWaitablesConsumerIfErrorTransformer = () => globalDefaultWaitablesConsumerIfErrorTransformer;

/**
 * Sets the default transformer to use with `WaitablesConsumer` for the error case.  This will be automatically added as the lowest priority
 * transformer on each `WaitablesConsumer`.
 *
 * This is useful, for example, to render error indicators in places where more-precise handling isn't required.
 *
 * The transformer receives the collection of dependencies passed to the `WaitablesConsumer` as well as the `ReactNode` returning the
 * waitable used for rendering, which could be reset when the user clicks the error indicator, for example.
 */
export const setDefaultWaitablesConsumerIfErrorTransformer = (ifErrorTransformer: IfErrorTransformer | undefined) => {
  globalDefaultWaitablesConsumerIfErrorTransformer = ifErrorTransformer;
};

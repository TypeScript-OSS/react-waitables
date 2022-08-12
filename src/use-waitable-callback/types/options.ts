import type { DependencyList } from 'react';

import type { WaitOptions } from '../../waitable/types/wait';
import type { WaitableDependencies } from '../../waitable/types/waitable-dependencies';
import type { IfNotReadyCallback } from './internal/if-not-ready-callback';

export interface UseWaitableCallbackOptions<ArgsT extends any[], DependenciesT extends WaitableDependencies> extends WaitOptions {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id?: string;

  /** On a rerender, deps changes are treated like hard reset bindings changes. */
  deps?: DependencyList;

  /** If `call` is called when not ready, this will be called instead of `ifReady` */
  ifNotReady?: IfNotReadyCallback<ArgsT, DependenciesT>;
}

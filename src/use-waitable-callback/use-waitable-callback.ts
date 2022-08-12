import { useDerivedBinding } from 'react-bindings';

import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { useDerivedWaitable } from '../specialized-waitables/use-derived-waitable/use-derived-waitable';
import type { WaitableDependencies } from '../waitable/types/waitable-dependencies';
import type { IfReadyCallback } from './types/internal/if-ready-callback';
import type { UseWaitableCallbackOptions } from './types/options';
import type { WaitableCallback } from './types/waitable-callback';

/**
 * Creates a function that isn't called until all waitable dependencies are successfully loaded.
 *
 * The resulting function also has special binding properties for checking if the functions is ready: `isReady` and `isNotReady`.
 */
export const useWaitableCallback = <ArgsT extends any[], DependenciesT extends WaitableDependencies>(
  dependencies: DependenciesT | undefined,
  ifReady: IfReadyCallback<ArgsT, DependenciesT>,
  { id = 'waitable-callback', deps, ifNotReady, ...waitOptions }: UseWaitableCallbackOptions<ArgsT, DependenciesT> = {}
): WaitableCallback<ArgsT> => {
  const dependencyValues = useDerivedWaitable(dependencies, (dependencies) => dependencies, {
    id: `${id}_dependencyValues`,
    deps,
    limitType: 'none'
  });

  const isReady = useDerivedBinding(
    dependencyValues.value,
    (dependencyValues) => dependencies === undefined || dependencyValues !== undefined,
    {
      id: `${id}_isReady`,
      limitType: 'none'
    }
  );
  const isNotReady = useDerivedBinding(isReady, (isReady) => !isReady, { id: `${id}_isNotReady`, limitType: 'none' });

  const output = useCallbackRef(async (...args: ArgsT) => {
    const waitResult = await dependencyValues.wait(waitOptions);

    const theDependencyValues = dependencyValues.value.get();
    if (theDependencyValues === undefined) {
      await ifNotReady?.(dependencies as DependenciesT, ...args);
    } else {
      await ifReady(theDependencyValues, dependencies as DependenciesT, ...args);
    }

    return waitResult;
  }) as WaitableCallback<ArgsT>;

  output.isReady = isReady;
  output.isNotReady = isNotReady;

  return output;
};

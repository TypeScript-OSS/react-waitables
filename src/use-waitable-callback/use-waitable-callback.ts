import { useCallbackRef, useDerivedBinding } from 'react-bindings';

import { useDerivedWaitable } from '../specialized-waitables/use-derived-waitable/use-derived-waitable.js';
import type { InferRequiredWaitableAndBindingValueTypes } from '../waitable/types/infer-waitable-and-binding-value-types';
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
  const dependencyValues = useDerivedWaitable(dependencies, (dependencies) => dependencies ?? null, {
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
      await ifReady(
        (dependencies === undefined ? undefined : theDependencyValues) as InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
        dependencies as DependenciesT,
        ...args
      );
    }

    return waitResult;
  }) as WaitableCallback<ArgsT>;

  output.isReady = isReady;
  output.isNotReady = isNotReady;
  output.bindArgs = (...args: ArgsT) => {
    const boundOutput = (() => output(...args)) as WaitableCallback<[]>;
    boundOutput.isReady = output.isReady;
    boundOutput.isNotReady = output.isNotReady;
    boundOutput.bindArgs = () => boundOutput;
    return boundOutput;
  };

  return output;
};

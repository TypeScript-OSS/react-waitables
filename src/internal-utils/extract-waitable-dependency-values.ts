import { isBinding, ReadonlyBinding } from 'react-bindings';

import type { InferOptionalWaitableAndBindingValueTypes } from '../waitable/types/infer-waitable-and-binding-value-types';
import type { Waitable } from '../waitable/types/waitable';
import type { NamedWaitableDependencies, WaitableDependencies } from '../waitable/types/waitable-dependencies';
import { isWaitable } from '../waitable/utils';

export const extractOptionalWaitableDependencyValues = <DependenciesT extends WaitableDependencies, FailureT>({
  dependencies,
  namedDependencyKeys
}: {
  dependencies: DependenciesT | undefined;
  namedDependencyKeys: string[] | undefined;
}): {
  allWaitablesAreLoaded: boolean;
  anyWaitablesHadErrors: boolean;
  lastError?: FailureT;
  values: InferOptionalWaitableAndBindingValueTypes<DependenciesT>;
} => {
  const isArray = Array.isArray(dependencies);
  const isNonNamed = isArray || isBinding(dependencies) || isWaitable(dependencies);

  const inout: { allWaitablesAreLoaded: boolean; anyWaitablesHadErrors: boolean; lastError?: FailureT } = {
    allWaitablesAreLoaded: true,
    anyWaitablesHadErrors: false,
    lastError: undefined
  };
  const makeOutput = (values: InferOptionalWaitableAndBindingValueTypes<DependenciesT>) => ({ ...inout, values });

  if (isNonNamed) {
    if (isArray) {
      return makeOutput(
        dependencies.map((dependency) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          extractValue(dependency, inout)
        ) as InferOptionalWaitableAndBindingValueTypes<DependenciesT>
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return makeOutput(extractValue(dependencies, inout) as InferOptionalWaitableAndBindingValueTypes<DependenciesT>);
    }
  } else if (namedDependencyKeys !== undefined) {
    const namedValues: Record<string, any> = {};
    for (const key of namedDependencyKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      namedValues[key] = extractValue((dependencies as NamedWaitableDependencies)[key], inout);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return makeOutput(namedValues as InferOptionalWaitableAndBindingValueTypes<DependenciesT>);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return makeOutput(undefined as InferOptionalWaitableAndBindingValueTypes<DependenciesT>);
  }
};

// Helpers

const extractValue = <T, FailureT>(
  dependency: Waitable<T> | ReadonlyBinding<T> | undefined,
  inout: { allWaitablesAreLoaded: boolean; anyWaitablesHadErrors: boolean; lastError?: FailureT }
): T | undefined => {
  if (isWaitable(dependency)) {
    const value = dependency.value.get();
    if (value === undefined) {
      inout.allWaitablesAreLoaded = false;

      const error = dependency.error.get() as FailureT | undefined;
      if (error !== undefined) {
        inout.anyWaitablesHadErrors = true;
        inout.lastError = error;
      }
    }
    return value;
  } else if (isBinding(dependency)) {
    return dependency.get();
  } else {
    return undefined;
  }
};

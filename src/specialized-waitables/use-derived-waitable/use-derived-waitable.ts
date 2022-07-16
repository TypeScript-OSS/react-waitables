import { useMemo } from 'react';
import { EmptyObject, isBinding, ReadonlyBinding, SingleOrArray } from 'react-bindings';

import { useCallbackRef } from '../../internal-hooks/use-callback-ref';
import { useStableValue } from '../../internal-hooks/use-stable-value';
import { concatArrays, normalizeAsArray, normalizeAsOptionalArray } from '../../internal-utils/array-like';
import { extractOptionalWaitableDependencyValues } from '../../internal-utils/extract-waitable-dependency-values';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import { makeValueThenDo } from '../../internal-utils/make-value-then-do';
import type { UseWaitableArgs } from '../../use-waitable/types/args';
import type { WaitablePrimaryFunction } from '../../use-waitable/types/primary-function';
import { useWaitable } from '../../use-waitable/use-waitable';
import type {
  InferOptionalWaitableAndBindingValueTypes,
  InferRequiredWaitableAndBindingValueTypes
} from '../../waitable/types/infer-waitable-and-binding-value-types';
import type { Waitable } from '../../waitable/types/waitable';
import type { WaitableDependencies } from '../../waitable/types/waitable-dependencies';
import { isWaitable } from '../../waitable/utils';
import type { UseDerivedWaitableNamedTransformers, UseDerivedWaitableRequiredValuesTransformer } from './types/transformers';

const emptyDependencies = Object.freeze({} as EmptyObject);

const emptyHardResetBindings = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;
const emptyLockedWhile = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;

/**
 * A derived waitable is a waitable derived from zero or more other waitables and bindings.  The value of a derived waitable is computed
 * using the specified transformers.
 *
 * The general usage pattern is something like:
 *
 * ```
 * const myWaitable = useDerivedWaitable(
 *   { someWaitable, someBinding },
 *   [({ someWaitable, someBinding }) => someWaitable + someBinding, { ifLoading: () => 'loading' }],
 *   { id: 'myWaitable' }
 * );
 * ```
 *
 * An unnamed transformer is the same as `{ ifLoaded: … }`
 *
 * Named transformer meanings:
 * - `'ifLoaded'` - None of the waitables have undefined values
 * - `'ifError'` - At least one waitable has a defined error
 * - `'ifLoading'` - At least one waitable has an undefined value but no waitables have defined errors
 * - `'ifErrorOrLoading'` - At least one waitable has an undefined value or at least one waitable has a defined error
 * - `'always'` - Always applicable
 *
 * @param dependencies - The waitables and bindings depended upon.  If waitables or bindings are named, their values will be extracted and
 * passed to the first applicable transformer function.
 * @param options - `useWaitable` options.
 * @param transformers - An ordered list of transformers.  The first applicable one is applied.  If multiple named rules are specified in a
 * single object, they are evaluated in the order: `ifLoaded`, `ifError`, `ifLoading`, `ifErrorOrLoading`, `always`
 */
export const useDerivedWaitable = <
  SuccessT,
  FailureT,
  DependenciesT extends WaitableDependencies = Record<string, never>,
  ExtraFieldsT = EmptyObject
>(
  dependencies: DependenciesT | undefined,
  transformers: SingleOrArray<
    | UseDerivedWaitableRequiredValuesTransformer<SuccessT, FailureT, DependenciesT>
    | UseDerivedWaitableNamedTransformers<SuccessT, FailureT, DependenciesT>
  >,
  args: UseWaitableArgs<SuccessT, FailureT, ExtraFieldsT>
) => {
  const normalizedTransformers = normalizeAsArray(transformers);

  const isNonNamedDependencies = Array.isArray(dependencies) || isWaitable(dependencies) || isBinding(dependencies);
  const nonNamedDependencies = isNonNamedDependencies ? dependencies : undefined;
  const namedDependencies = isNonNamedDependencies ? undefined : dependencies;
  const namedDependencyKeys = namedDependencies !== undefined ? getTypedKeys(namedDependencies) : undefined;
  const stableAllDependencies = useStableValue(
    isNonNamedDependencies ? normalizeAsArray(nonNamedDependencies) : Object.values(namedDependencies ?? emptyDependencies)
  );
  const stableAllWaitables = useMemo(
    () => stableAllDependencies.filter((dep) => isWaitable(dep)) as Waitable<any>[],
    [stableAllDependencies]
  );
  const stableAllBindings = useMemo(
    () => stableAllDependencies.filter((dep) => isBinding(dep)) as ReadonlyBinding<any>[],
    [stableAllDependencies]
  );

  const stableWaitableIsCompletes = stableAllWaitables.map((waitable) => waitable?.isComplete);
  const stableWaitableIsLockedWithoutValueBindings = stableAllWaitables.map((waitable) => waitable?.isLockedWithoutValue);

  /**
   * Gets the first transformer for the loaded state, where all waitables have defined values.  The first applicable transformer from the
   * `normalizedTransformers` list is returned.
   *
   * Transformers are applicable if:
   *
   * - They are unnamed (the default transformed is the same as the `ifLoaded` transformer)
   * - They are named as either `ifLoaded` or `always`
   *
   * In a single object of named transformers, `ifLoaded` takes priority over `always`.
   */
  const getLoadedTransformer = useCallbackRef(() => {
    for (const transformer of normalizedTransformers) {
      if (typeof transformer === 'function') {
        return transformer;
      } else if (transformer.ifLoaded !== undefined) {
        return transformer.ifLoaded;
      } else if (transformer.always !== undefined) {
        return transformer.always;
      }
    }

    return undefined;
  });

  /**
   * Gets the first transformer for the error state.  The first applicable transformer from the `normalizedTransformers` list is returned.
   *
   * Transformers are applicable if they are named as either `ifError`, `ifErrorOrLoading`, or `always`, which is also the preferred order
   * if multiple named transformers are included in a single object.
   */
  const getErrorTransformer = useCallbackRef(() => {
    for (const transformer of normalizedTransformers) {
      if (typeof transformer !== 'function') {
        const t = transformer.ifError ?? transformer.ifErrorOrLoading ?? transformer.always;
        if (t !== undefined) {
          return t;
        }
      }
    }

    return undefined;
  });

  /**
   * Gets the first transformer for the loading state.  The first applicable transformer from the `normalizedTransformers` list is returned.
   *
   * Transformers are applicable if they are named as either `ifLoading`, `ifErrorOrLoading`, or `always`, which is also the preferred order
   * if multiple named transformers are included in a single object.
   */
  const getLoadingTransformer = useCallbackRef(() => {
    for (const transformer of normalizedTransformers) {
      if (typeof transformer !== 'function') {
        const t = transformer.ifLoading ?? transformer.ifErrorOrLoading ?? transformer.always;
        if (t !== undefined) {
          return t;
        }
      }
    }

    return undefined;
  });

  /**
   * Evaluates the dependencies, extract named dependency values, and runs the most appropriate transformer.
   *
   * - If any waitables have defined errors, the overall state is `'error'`
   * - If any waitables have undefined values, the overall state is `'loading'`
   * - Otherwise, the overall state is `'loaded'`
   */
  const evaluate: WaitablePrimaryFunction<SuccessT, FailureT> = useCallbackRef(({ setSuccess, setFailure, wasReset }) => {
    const { allWaitablesAreLoaded, anyWaitablesHadErrors, lastError, values } = extractOptionalWaitableDependencyValues<
      DependenciesT,
      FailureT
    >({
      dependencies,
      namedDependencyKeys
    });

    if (allWaitablesAreLoaded) {
      // Loaded
      return makeValueThenDo<SuccessT | undefined>(
        () =>
          getLoadedTransformer()?.(
            values as InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
            dependencies ?? (emptyDependencies as DependenciesT),
            setFailure,
            wasReset
          ),
        setSuccess
      );
    } else if (anyWaitablesHadErrors) {
      // Error
      return makeValueThenDo(
        () =>
          getErrorTransformer()?.(
            values as InferOptionalWaitableAndBindingValueTypes<DependenciesT>,
            dependencies ?? (emptyDependencies as DependenciesT),
            setFailure,
            wasReset
          ),
        (value) => {
          if (value !== undefined) {
            setSuccess?.(value);
          } else {
            setFailure?.(lastError!);
          }
        }
      );
    } else {
      // Loading
      return makeValueThenDo<SuccessT | undefined>(
        () =>
          getLoadingTransformer()?.(
            values as InferOptionalWaitableAndBindingValueTypes<DependenciesT>,
            dependencies ?? (emptyDependencies as DependenciesT),
            setFailure,
            wasReset
          ),
        setSuccess
      );
    }
  });

  return useWaitable<SuccessT, FailureT, ExtraFieldsT>(evaluate, {
    defaultValue: 'use-primary-function',
    ...args,
    hardResetBindings: concatArrays(
      normalizeAsOptionalArray(args.hardResetBindings) ?? emptyHardResetBindings,
      stableWaitableIsCompletes,
      stableAllBindings
    ),
    lockedWhile: concatArrays(normalizeAsOptionalArray(args.lockedWhile) ?? emptyLockedWhile, stableWaitableIsLockedWithoutValueBindings)
  });
};

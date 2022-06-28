import { useMemo } from 'react';
import { EmptyObject, isBinding, ReadonlyBinding, SingleOrArray } from 'react-bindings';

import { useCallbackRef } from '../../internal-hooks/use-callback-ref';
import { useStableValue } from '../../internal-hooks/use-stable-value';
import { concatArrays, normalizeAsArray, normalizeAsOptionalArray } from '../../internal-utils/array-like';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import { makeValueThenDo } from '../../internal-utils/make-value-then-do';
import { WaitablePrimaryFunction } from '../../use-waitable/exports';
import type { UseWaitableArgs } from '../../use-waitable/types/args';
import { useWaitable } from '../../use-waitable/use-waitable';
import type {
  ExtractOptionalNamedWaitablesAndBindingValues,
  ExtractRequiredNamedWaitablesAndBindingValues
} from '../../waitable/types/extract-named-waitables-and-binding-values';
import type { Waitable } from '../../waitable/types/waitable';
import { isWaitable } from '../../waitable/utils';
import type { UseDerivedWaitableNamedTransformers, UseDerivedWaitableRequiredValuesTransformer } from './types/transformers';

const emptyNamedDependencies = Object.freeze({} as EmptyObject);
const emptyNamedDependencyValues: Readonly<EmptyObject> = Object.freeze({});

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
  NamedDependenciesT extends Record<string, Waitable<any> | ReadonlyBinding | undefined> = Record<string, never>,
  ExtraFieldsT = EmptyObject
>(
  dependencies: SingleOrArray<Waitable<any> | ReadonlyBinding | undefined> | NamedDependenciesT,
  transformers: SingleOrArray<
    | UseDerivedWaitableRequiredValuesTransformer<SuccessT, FailureT, NamedDependenciesT>
    | UseDerivedWaitableNamedTransformers<SuccessT, FailureT, NamedDependenciesT>
  >,
  args: UseWaitableArgs<SuccessT, FailureT, ExtraFieldsT>
) => {
  const normalizedTransformers = normalizeAsArray(transformers);

  const isNonNamedDependencies = Array.isArray(dependencies) || isWaitable(dependencies) || isBinding(dependencies);
  const nonNamedDependencies = isNonNamedDependencies ? dependencies : undefined;
  const namedDependencies = isNonNamedDependencies ? undefined : dependencies;
  const namedDependencyKeys = namedDependencies !== undefined ? getTypedKeys(namedDependencies) : undefined;
  const stableAllDependencies = useStableValue(
    isNonNamedDependencies ? normalizeAsArray(nonNamedDependencies) : Object.values(namedDependencies ?? emptyNamedDependencies)
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
  const evaluate: WaitablePrimaryFunction<SuccessT, FailureT> = useCallbackRef(({ setSuccess, setFailure }) => {
    if (namedDependencyKeys === undefined || namedDependencies === undefined) {
      // Loaded
      return makeValueThenDo<SuccessT | undefined>(
        () =>
          getLoadedTransformer()?.(
            emptyNamedDependencyValues as ExtractRequiredNamedWaitablesAndBindingValues<NamedDependenciesT>,
            namedDependencies ?? (emptyNamedDependencies as NamedDependenciesT),
            setFailure
          ),
        setSuccess
      );
    }

    const namedValues: Partial<ExtractOptionalNamedWaitablesAndBindingValues<NamedDependenciesT>> = {};
    let areAllWaitablesHavingDefinedValues = true;
    let lastError: FailureT | undefined = undefined;

    for (const key of namedDependencyKeys) {
      const dep = namedDependencies[key];
      if (isWaitable(dep)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = dep.value.get();
        if (value === undefined) {
          areAllWaitablesHavingDefinedValues = false;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const error = dep.error.get();
          if (error !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            lastError = error;
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        namedValues[key] = value;
      } else if (isBinding(dep)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        namedValues[key] = dep.get();
      }
    }

    if (areAllWaitablesHavingDefinedValues) {
      // Loaded
      return makeValueThenDo<SuccessT | undefined>(
        () =>
          getLoadedTransformer()?.(
            namedValues as ExtractRequiredNamedWaitablesAndBindingValues<NamedDependenciesT>,
            namedDependencies ?? (emptyNamedDependencies as NamedDependenciesT),
            setFailure
          ),
        setSuccess
      );
    } else if (lastError !== undefined) {
      // Error
      return makeValueThenDo(
        () =>
          getErrorTransformer()?.(
            namedValues as ExtractOptionalNamedWaitablesAndBindingValues<NamedDependenciesT>,
            namedDependencies ?? (emptyNamedDependencies as NamedDependenciesT),
            setFailure
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
            namedValues as ExtractOptionalNamedWaitablesAndBindingValues<NamedDependenciesT>,
            namedDependencies ?? (emptyNamedDependencies as NamedDependenciesT),
            setFailure
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

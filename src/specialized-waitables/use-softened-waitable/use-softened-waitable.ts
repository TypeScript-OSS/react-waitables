import { useRef } from 'react';
import { EmptyObject } from 'react-bindings';

import { concatArrays, normalizeAsOptionalArray } from '../../internal-utils/array-like';
import { Waitable } from '../../waitable/types/waitable';
import { useDerivedWaitable } from '../use-derived-waitable/use-derived-waitable';
import { UseSoftenedWaitableArgs } from './types';

/**
 * Derives a waitable from another waitable where the last known value of the original waitable is remembered until a new value is
 * available.  This is useful for async waitables that are frequently reset where the last known value is good enough, for display purposes
 * for example.
 *
 * Hard resets on the softened waitable clear out the remembered values.
 */
export const useSoftenedWaitable = <SuccessT, FailureT, ExtraFieldsT = EmptyObject>(
  originalWaitable: Waitable<SuccessT, FailureT>,
  args: UseSoftenedWaitableArgs<SuccessT, FailureT, ExtraFieldsT>
) => {
  const lastSuccess = useRef<SuccessT | undefined>(undefined);
  const lastFailure = useRef<FailureT | undefined>(undefined);

  const softenedWaitable = useDerivedWaitable(
    undefined,
    (_dependencyValues, _dependencies, setFailure): SuccessT | undefined => {
      const value = originalWaitable.value.get();
      const error = originalWaitable.error.get();
      if (value !== undefined) {
        lastFailure.current = undefined;
        lastSuccess.current = value;
        return value;
      } else if (error !== undefined) {
        lastFailure.current = error;
        lastSuccess.current = undefined;
        setFailure(error);
        return undefined;
      } else if (lastSuccess.current !== undefined) {
        return lastSuccess.current;
      } else if (lastFailure.current !== undefined) {
        setFailure(lastFailure.current);
        return undefined;
      } else {
        return undefined;
      }
    },
    {
      ...args,
      defaultValue: () => originalWaitable.value.get(),
      limitType: 'none',
      softResetBindings: concatArrays([originalWaitable.isComplete], normalizeAsOptionalArray(args.softResetBindings)),
      onReset: (resetType) => {
        if (resetType === 'hard') {
          lastFailure.current = undefined;
          lastSuccess.current = undefined;
        }

        args.onReset?.(resetType);
      }
    }
  );
  return softenedWaitable;
};

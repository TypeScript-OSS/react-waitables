import type { EmptyObject } from 'react-bindings';

import { makeValueThenDo } from '../internal-utils/make-value-then-do';
import type { TypeOrPromisedType } from '../resolveable/types';
import type { UseWaitableArgs } from '../use-waitable/types/args';
import { useWaitable } from '../use-waitable/use-waitable';
import type { WrappedResult } from '../waitable/types/wrapped-result';

/**
 * A waitable that gets its state from the result of the specified function.
 *
 * Results must be wrapped and marked as ok (success) or not (error).
 *
 * This is likely a more natural form to work with in cases that don't require the ability to call `setSuccess` or `setFailure` more than
 * once during a single run.
 */
export const useWaitableFunction = <SuccessT, FailureT = any, ExtraFieldsT = EmptyObject>(
  primaryFunc: () => TypeOrPromisedType<WrappedResult<SuccessT, FailureT>>,
  options: UseWaitableArgs<SuccessT, FailureT, ExtraFieldsT>
) =>
  useWaitable<SuccessT, FailureT, ExtraFieldsT>(
    ({ setSuccess, setFailure }) =>
      makeValueThenDo(primaryFunc, (result) => {
        if (result === undefined) {
          return;
        }

        if (result.ok) {
          setSuccess(result.value);
        } else {
          setFailure(result.value);
        }
      }),
    options
  );

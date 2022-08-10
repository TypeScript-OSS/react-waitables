import type { EmptyObject, LimiterOptions } from 'react-bindings';

import type { UseWaitableArgs } from '../../use-waitable/types/args';

export type UseSoftenedWaitableArgs<SuccessT, FailureT = any, ExtraFieldsT = EmptyObject> = Omit<
  UseWaitableArgs<SuccessT, FailureT, ExtraFieldsT>,
  'defaultValue' | keyof LimiterOptions
>;

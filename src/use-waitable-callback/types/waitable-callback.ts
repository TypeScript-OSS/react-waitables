import type { ReadonlyBinding } from 'react-bindings';

import type { TypeOrPromisedType } from '../../resolveable/types';
import type { WaitResult } from '../../waitable/types/wait';

/** The result of calling `useWaitableCallback` */
export interface WaitableCallback<ArgsT extends any[]> {
  /** `true` if all of the dependencies are ready (i.e. if all of the waitables are successfully loaded), `false` otherwise */
  isReady: ReadonlyBinding<boolean>;
  /** The opposite of `isReady` */
  isNotReady: ReadonlyBinding<boolean>;

  (...args: ArgsT): TypeOrPromisedType<WaitResult>;
}

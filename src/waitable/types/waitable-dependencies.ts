import type { ReadonlyBinding } from 'react-bindings';

import type { Waitable } from './waitable';

export type WaitableArrayDependencies = Array<Waitable<any> | ReadonlyBinding | undefined> | [Waitable<any> | ReadonlyBinding];

export type NamedWaitableDependencies = Record<string, Waitable<any> | ReadonlyBinding | undefined>;

export type WaitableDependencies = Waitable<any> | ReadonlyBinding | WaitableArrayDependencies | NamedWaitableDependencies | undefined;

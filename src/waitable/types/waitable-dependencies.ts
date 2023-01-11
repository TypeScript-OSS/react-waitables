import type { ReadonlyBinding } from 'react-bindings';

import type { Waitable } from './waitable';

export type SingleWaitableDependency = Waitable<any> | ReadonlyBinding | undefined;

export type WaitableArrayDependencies = Array<SingleWaitableDependency>;

export type NamedWaitableDependencies = Record<string, SingleWaitableDependency>;

export type WaitableDependencies = SingleWaitableDependency | WaitableArrayDependencies | NamedWaitableDependencies;

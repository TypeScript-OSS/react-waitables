import type { Waitable } from './waitable';

/** Infers the success type of the waitable */
export type InferWaitableSuccessType<T> = T extends Waitable<infer SuccessT, infer _FailureT> ? Exclude<SuccessT, undefined> : never;

/** Infers the failure type of the waitable */
export type InferWaitableFailureType<T> = T extends Waitable<infer _SuccessT, infer FailureT> ? FailureT : never;

import type { Waitable } from './types/waitable';

/** Checks if the specified value is a waitable */
export const isWaitable = (value: any): value is Waitable<any, any> =>
  value !== null && typeof value === 'object' && 'isWaitable' in value && (value as { isWaitable: unknown }).isWaitable === true;

/** Returns a readonly waitable if the specified value is a waitable.  Otherwise, returns undefined */
export const ifWaitable = <SuccessT, FailureT>(value: any): Waitable<SuccessT, FailureT> | undefined =>
  isWaitable(value) ? (value as Waitable<SuccessT, FailureT>) : undefined;

import type { Waitable } from './types/waitable';

/** Checks if the specified value is a waitable */
export const isWaitable = (value: any): value is Waitable<any, any> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  value !== null && typeof value === 'object' && 'isWaitable' in value && value.isWaitable === true;

/** Returns a readonly waitable if the specified value is a waitable.  Otherwise, returns undefined */
export const ifWaitable = <SuccessT, FailureT>(value: Waitable<SuccessT, FailureT> | any): Waitable<SuccessT, FailureT> | undefined =>
  isWaitable(value) ? (value as Waitable<SuccessT, FailureT>) : undefined;

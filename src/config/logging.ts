/* istanbul ignore file */

const globalSpecialLoggingEnabledFor: Partial<Record<SpecialLoggingType, boolean | undefined>> = {
  'waitable-locking-warnings': false
};

export type SpecialLoggingType = 'waitable-locking-warnings';

/** Checks if logging is enabled for the specified type */
export const isSpecialLoggingEnabledFor = (type: SpecialLoggingType) => globalSpecialLoggingEnabledFor[type] ?? false;

/** Enables or disables logging for the specified type */
export const setSpecialLoggingEnabledFor = (type: SpecialLoggingType, enabled: boolean) => (globalSpecialLoggingEnabledFor[type] = enabled);

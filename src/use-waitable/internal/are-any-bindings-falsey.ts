import type { ReadonlyBinding } from 'react-bindings';

/** Checks an array of bindings to see if any have falsey values */
export const areAnyBindingsFalsey = (bindings: readonly (ReadonlyBinding | undefined)[]) => {
  for (const binding of bindings) {
    if (binding !== undefined && !Boolean(binding.get())) {
      return true;
    }
  }

  return false;
};

import isPromise from 'is-promise';

import type { TypeOrPromisedType } from '../resolveable/types';

/**
 * Runs a function, with the specified arguments, to make a value and then runs a subsequent function.  The subsequent function is run even
 * if an exception is thrown while making the value.  This efficiently handles value generation functions that return promises and that
 * don't.
 */
export const makeValueWithArgsThenDo = <ArgsT extends any[], T>(
  makeValue: (...args: ArgsT) => TypeOrPromisedType<T>,
  args: ArgsT,
  thenDo: (value?: T) => void
): TypeOrPromisedType<void> => {
  let value: TypeOrPromisedType<T>;
  let makeValueSuccess = false;
  try {
    value = makeValue(...args);
    makeValueSuccess = true;
  } finally {
    if (!makeValueSuccess) {
      thenDo();
    }
  }

  if (isPromise(value)) {
    return (async () => {
      let awaitValueSuccess = false;
      try {
        const output = await value;
        awaitValueSuccess = true;
        thenDo(output);
      } finally {
        if (!awaitValueSuccess) {
          thenDo();
        }
      }
    })();
  } else {
    thenDo(value);
  }
};

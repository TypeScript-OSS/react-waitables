import type { SingleOrArray } from 'react-bindings';

/** Normalizes a SingleOrArray value as an array */
export const normalizeAsArray = <T>(value: SingleOrArray<T>) => (Array.isArray(value) ? value : [value]);

/** Normalizes a SingleOrArray value as an array or undefined */
export const normalizeAsOptionalArray = <T>(value?: SingleOrArray<T>) =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

/** Returns an array by efficiently concatenating multiple potential arrays as needed. */
export const concatArrays = <T>(...arrays: Array<T[] | undefined>): T[] => {
  if (arrays.length <= 1) {
    return arrays[0] ?? [];
  }

  // Detects if we have more than one array with item -- stops looking once we know the answer
  let numArraysWithItems = 0;
  let lastArrayWithItems: T[] | undefined;
  for (const array of arrays) {
    if (array !== undefined && array.length > 0) {
      numArraysWithItems += 1;
      lastArrayWithItems = array;

      if (numArraysWithItems > 1) {
        break;
      }
    }
  }

  if (numArraysWithItems <= 1) {
    return lastArrayWithItems ?? [];
  } else {
    const output: T[] = [];
    for (const array of arrays) {
      if (array !== undefined && array.length > 0) {
        output.push(...array);
      }
    }
    return output;
  }
};

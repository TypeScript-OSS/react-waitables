import { waitFor } from '@testing-library/react';

import { runInDom } from '../../../__test_dependency__/index.js';
import { useWaitableFunction } from '../../use-waitable-function.js';
import { useDerivedWaitable } from '../use-derived-waitable.js';

describe('useDerivedWaitable', () => {
  it('with named ifLoaded transformer', () =>
    runInDom(() => {
      const a = useDerivedWaitable(undefined, { ifLoaded: () => 1 }, { id: 'c' });

      expect(a.value.get()).toBe(1);
    }));

  it('with named ifError transformer', () =>
    runInDom(({ onMount }) => {
      const a = useDerivedWaitable(
        useWaitableFunction(() => ({ ok: false, value: 'error' }), { id: 'test' }),
        {
          ifLoaded: () => 1,
          ifError: () => 2,
          always: () => 3
        },
        { id: 'c' }
      );

      expect(a.value.get()).toBe(3);

      onMount(async () => {
        await waitFor(() => expect(a.value.get()).toBe(2));
      });
    }));
});

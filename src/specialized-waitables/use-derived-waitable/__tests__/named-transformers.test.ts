import { waitFor } from '@testing-library/react';

import { runInDom } from '../../../__test_dependency__';
import { useWaitableFunction } from '../../use-waitable-function';
import { useDerivedWaitable } from '../use-derived-waitable';

describe('useDerivedWaitable', () => {
  it('with named ifLoaded tranformer', () =>
    runInDom(() => {
      const a = useDerivedWaitable(undefined, { ifLoaded: () => 1 }, { id: 'c' });

      expect(a.value.get()).toBe(1);
    }));

  it('with named ifError tranformer', () =>
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

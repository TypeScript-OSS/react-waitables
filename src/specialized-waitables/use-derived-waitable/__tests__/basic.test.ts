import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../../__test_dependency__/sleep.js';
import { useWaitableFunction } from '../../use-waitable-function.js';
import { useDerivedWaitable } from '../use-derived-waitable.js';

describe('useDerivedWaitable', () => {
  it('with undefined dependencies and synchronous primary function should be resolved immediately', () =>
    runInDom(() => {
      const a = useDerivedWaitable(undefined, () => 1, { id: 'c' });

      expect(a.value.get()).toBe(1);
    }));

  it('with undefined dependencies and asynchronous primary function should be resolved after being given enough time to run', () =>
    runInDom(({ onMount }) => {
      const a = useDerivedWaitable(
        undefined,
        async () => {
          await sleep(50);
          return 1;
        },
        { id: 'c' }
      );

      expect(a.value.get()).toBeUndefined();

      onMount(async () => {
        await sleep(50);

        expect(a.value.get()).toBe(1);
      });
    }));

  it('should work with both named binding and waitables', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useWaitableFunction(
        async () => {
          await sleep(50);
          return { ok: true, value: 2 };
        },
        { id: 'b' }
      );
      const c = useDerivedWaitable({ a, b }, ({ a, b }) => a + b, { id: 'c' });

      expect(c.value.get()).toBeUndefined();

      onMount(async () => {
        await waitFor(() => expect(c.value.get()).toBe(3));
      });
    }));
});

import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../../__test_dependency__/sleep.js';
import { useWaitableFunction } from '../../use-waitable-function.js';
import { useDerivedWaitable } from '../use-derived-waitable.js';

describe('useDerivedWaitable', () => {
  it("if the first transformer isn't applicable, a secondary transformer can be used (always)", () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useWaitableFunction(
        async () => {
          await sleep(50);
          return { ok: true, value: 2 };
        },
        { id: 'b' }
      );
      const c = useDerivedWaitable({ a, b }, [({ a, b }) => a + b, { always: () => 99 }], { id: 'c' });

      expect(c.value.get()).toBe(99);

      onMount(async () => {
        await waitFor(() => expect(c.value.get()).toBe(3));
      });
    }));

  it("if the first transformer isn't applicable, a secondary transformer can be used (ifLoading)", () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useWaitableFunction(
        async () => {
          await sleep(50);
          return { ok: true, value: 2 };
        },
        { id: 'b' }
      );
      const c = useDerivedWaitable({ a, b }, [({ a, b }) => a + b, { ifLoading: () => 99 }], { id: 'c' });

      expect(c.value.get()).toBe(99);

      onMount(async () => {
        await waitFor(() => expect(c.value.get()).toBe(3));
      });
    }));
});

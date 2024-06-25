import { jest } from '@jest/globals';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../__test_dependency__/sleep.js';
import { useWaitableFunction } from '../../specialized-waitables/use-waitable-function.js';
import type { IfNotReadyCallback } from '../types/internal/if-not-ready-callback';
import type { IfReadyCallback } from '../types/internal/if-ready-callback';
import { useWaitableCallback } from '../use-waitable-callback.js';

describe('useWaitableCallback', () => {
  it('should work with undefined dependencies', () =>
    runInDom(({ onMount }) => {
      const ifReadyCallback = jest.fn<IfReadyCallback<[], undefined>>();
      const myWaitableCallback = useWaitableCallback(undefined, ifReadyCallback);

      onMount(async () => {
        expect(ifReadyCallback).not.toHaveBeenCalled();
        const res = await myWaitableCallback();
        expect(res).toBe('success');
        expect(ifReadyCallback).toHaveBeenCalledTimes(1);
      });
    }));

  it('should work with 0ms timeout', () =>
    runInDom(({ onMount }) => {
      const myWaitable = useWaitableFunction(
        async () => {
          await sleep(50);

          return { ok: true, value: 1 };
        },
        { id: 'myWaitable' }
      );

      const ifReadyCallback = jest.fn<IfReadyCallback<[], typeof myWaitable>>();
      const ifNotReadyCallback = jest.fn<IfNotReadyCallback<[], typeof myWaitable>>();
      const myWaitableCallback = useWaitableCallback(myWaitable, ifReadyCallback, { timeoutMSec: 0, ifNotReady: ifNotReadyCallback });

      onMount(async () => {
        expect(ifReadyCallback).not.toHaveBeenCalled();
        expect(ifNotReadyCallback).not.toHaveBeenCalled();
        const res1 = await myWaitableCallback();
        expect(res1).toBe('timeout');
        expect(ifReadyCallback).not.toHaveBeenCalled();
        expect(ifNotReadyCallback).toHaveBeenCalledTimes(1);

        await sleep(100);
        const res2 = await myWaitableCallback();
        expect(res2).toBe('success');

        expect(ifReadyCallback).toHaveBeenCalledTimes(1);
        expect(ifNotReadyCallback).toHaveBeenCalledTimes(1);
      });
    }));

  it('should work with no timeout', () =>
    runInDom(({ onMount }) => {
      const myWaitable = useWaitableFunction(
        async () => {
          await sleep(50);

          return { ok: true, value: 1 };
        },
        { id: 'myWaitable' }
      );

      const ifReadyCallback = jest.fn<IfReadyCallback<[], typeof myWaitable>>();
      const ifNotReadyCallback = jest.fn<IfNotReadyCallback<[], typeof myWaitable>>();
      const myWaitableCallback = useWaitableCallback(myWaitable, ifReadyCallback, { ifNotReady: ifNotReadyCallback });

      onMount(async () => {
        expect(ifReadyCallback).not.toHaveBeenCalled();
        expect(ifNotReadyCallback).not.toHaveBeenCalled();
        const res = await myWaitableCallback();
        expect(res).toBe('success');

        expect(ifReadyCallback).toHaveBeenCalledTimes(1);
        expect(ifNotReadyCallback).not.toHaveBeenCalled();
      });
    }));
});

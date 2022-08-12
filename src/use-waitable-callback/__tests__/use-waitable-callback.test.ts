import { runInDom, sleep } from '../../__test_dependency__';
import { useWaitableFunction } from '../../specialized-waitables/use-waitable-function';
import { useWaitableCallback } from '../use-waitable-callback';

describe('useWaitableCallback', () => {
  it('should work with undefined dependencies', () =>
    runInDom(({ onMount }) => {
      const ifReadyCallback = jest.fn();
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

      const ifReadyCallback = jest.fn();
      const ifNotReadyCallback = jest.fn();
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

      const ifReadyCallback = jest.fn();
      const ifNotReadyCallback = jest.fn();
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

import { runInDom, sleep } from '../../__test_dependency__';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  it('wait should resolve once waitable has value', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(300);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        const result = await waitable.wait({ timeoutMSec: 500 });
        expect(result).toBe('success');

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('wait should timeout if not given enough time to run', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(300);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        const result = await waitable.wait({ timeoutMSec: 10 });
        expect(result).toBe('timeout');
      });
    }));

  it("wait should get back 'reset' if the waitable is reset before completion and continueWaitingOnReset=false", () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(300);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        setTimeout(() => waitable.reset('hard'), 10);
        const result = await waitable.wait({ continueWaitingOnReset: false });
        expect(result).toBe('reset');

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it("wait should get back 'success' if the waitable is reset before completion and continueWaitingOnReset=true", () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(300);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        setTimeout(() => waitable.reset('hard'), 10);
        const result = await waitable.wait({ continueWaitingOnReset: true });
        expect(result).toBe('success');

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
      });
    }));

  it("wait should get back 'failure' if the waitable has an error", () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setFailure }) => {
        await sleep(300);
        setFailure(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        const result = await waitable.wait();
        expect(result).toBe('failure');

        expect(waitable.error.get()).toBe(1);
        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));
});

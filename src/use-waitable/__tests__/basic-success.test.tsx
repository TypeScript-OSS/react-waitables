import { runInDom, sleep } from '../../__test_dependency__';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  it('synchronously set success value should be resolved within 1 tick after mount', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await sleep(50); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('synchronously set success value should be resolved immediately with defaultValue=use-primary-function', () =>
    runInDom(() => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      expect(waitable.value.get()).toBe(1);
      expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
    }));

  it('asynchronously set success value should be resolved immediately with a synchronous defaultValue function and then updated once the primary function completes', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: () => 0 });

      expect(waitable.value.get()).toBe(0);
      expect(waitablePrimaryFunc).toHaveBeenCalledTimes(0);

      onMount(async () => {
        await sleep(300);

        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('asynchronously set success value should be resolved after being given enough time to run', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await sleep(300); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('asynchronously set success value should be resolved after being given enough time to run with defaultValue=use-primary-function, but the primary function should only run once', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await sleep(300); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));
});
import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../__test_dependency__/sleep.js';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable.js';

describe('useWaitable', () => {
  it('synchronously thrown value should', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(() => {
        throw new Error('test');
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await sleep(50); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('synchronously set error value should be ignored with defaultValue=use-primary-function', () =>
    runInDom(() => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(() => {
        throw new Error('test');
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      expect(waitable.error.get()).toBeUndefined();
      expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
    }));

  it('asynchronously set error value should be resolved after being given enough time to run', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async () => {
        await sleep(50);
        throw new Error('test');
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();
      });
    }));

  it('asynchronously set error value should be resolved after being given enough time to run with defaultValue=use-primary-function, but the primary function should only run once', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async () => {
        await sleep(50);
        throw new Error('test');
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2));

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();
      });
    }));
});

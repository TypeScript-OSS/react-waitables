import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { runInDom, sleep } from '../../__test_dependency__/index.js';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable.js';

describe('useWaitable', () => {
  it('synchronously set error value should be resolved within 1 tick after mount', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setFailure }) => {
        setFailure(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await sleep(50); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBe(1);
        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('synchronously set error value should be ignored with defaultValue=use-primary-function', () =>
    runInDom(() => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setFailure }) => {
        setFailure(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      expect(waitable.error.get()).toBeUndefined();
      expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
    }));

  it('asynchronously set error value should be resolved after being given enough time to run', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(async ({ setFailure }) => {
        await sleep(50);
        setFailure(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await waitFor(() => expect(waitable.error.get()).toBe(1));

        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));

  it('asynchronously set error value should be resolved after being given enough time to run with defaultValue=use-primary-function, but the primary function should only run once', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(async ({ setFailure }) => {
        await sleep(50);
        setFailure(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', defaultValue: 'use-primary-function' });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();

        await waitFor(() => expect(waitable.error.get()).toBe(1));

        expect(waitable.value.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
      });
    }));
});

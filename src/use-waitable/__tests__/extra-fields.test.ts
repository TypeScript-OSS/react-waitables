import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../__test_dependency__/sleep.js';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable.js';

describe('useWaitable', () => {
  it('extra fields should work', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });
      const waitable = useWaitable(waitablePrimaryFunc, {
        id: 'test',
        addFields: (waitable) => ({
          isEven: () => {
            const value = waitable.value.get();
            return value !== undefined ? value % 2 === 0 : undefined;
          }
        })
      });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBeUndefined();
        expect(waitable.isEven()).toBeUndefined();

        await waitFor(() => expect(waitable.value.get()).toBe(1));

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.isEven()).toBe(false);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));
});

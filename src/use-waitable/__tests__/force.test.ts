import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { runInDom } from '../../__test_dependency__/index.js';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable.js';

describe('useWaitable', () => {
  it('setting force should use that value, unsetting should calculate', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
        setSuccess(1);
      });
      const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

      waitable.force.set({ ok: true, value: 123.456 });

      onMount(async () => {
        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toEqual(123.456);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(0);

        waitable.force.set(undefined);

        await waitFor(() => expect(waitable.value.get()).toEqual(1));
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));
});

import { runInDom, sleep } from '../../__test_dependency__';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  it('extra fields should work', () =>
    runInDom(({ onMount }) => {
      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
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

        await sleep(300); // Giving the waitable a chance to run

        expect(waitable.error.get()).toBeUndefined();
        expect(waitable.value.get()).toBe(1);
        expect(waitable.isEven()).toBe(false);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
      });
    }));
});

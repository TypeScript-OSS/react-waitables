import { useBinding, useConstBinding } from 'react-bindings';

import { runInDom, sleep } from '../../__test_dependency__';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  describe('lockedWhile', () => {
    it("locked waitable shouldn't run", () =>
      runInDom(({ onMount }) => {
        const lock = useConstBinding(true, { id: 'lock' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();
        });
      }));

    it("previously locked waitable should run once it's unlocked", () =>
      runInDom(({ onMount }) => {
        const lock = useBinding(() => true, { id: 'lock' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          lock.set(false);

          await sleep(300); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        });
      }));

    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const lock1 = useBinding(() => true, { id: 'lock1' });
        const lock2 = useBinding(() => true, { id: 'lock2' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: [lock1, lock2] });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          lock1.set(false);

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          lock2.set(false);

          await sleep(300); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        });
      }));
  });

  describe('lockedUntil', () => {
    it("locked waitable shouldn't run", () =>
      runInDom(({ onMount }) => {
        const unlock = useConstBinding(false, { id: 'unlock' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();
        });
      }));

    it("previously locked waitable should run once it's unlocked", () =>
      runInDom(({ onMount }) => {
        const unlock = useBinding(() => false, { id: 'unlock' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          unlock.set(true);

          await sleep(300); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        });
      }));

    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const unlock1 = useBinding(() => false, { id: 'unlock1' });
        const unlock2 = useBinding(() => false, { id: 'unlock2' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: [unlock1, unlock2] });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          unlock1.set(true);

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          unlock2.set(true);

          await sleep(300); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        });
      }));
  });

  describe('both lockedWhile and lockedUntil', () => {
    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const lock = useBinding(() => true, { id: 'lock' });
        const unlock = useBinding(() => false, { id: 'unlock' });
        const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock, lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          lock.set(false);

          await sleep(300); // Giving the waitable a chance to run (though it shouldn't)

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).not.toHaveBeenCalled();

          unlock.set(true);

          await sleep(300); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        });
      }));
  });
});

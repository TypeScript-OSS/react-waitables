import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import { useBinding, useConstBinding } from 'react-bindings';

import { runInDom } from '../../__test_dependency__/index.js';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable.js';

describe('useWaitable', () => {
  describe('lockedWhile', () => {
    it("locked waitable shouldn't run", () =>
      runInDom(({ onMount }) => {
        const lock = useConstBinding(true, { id: 'lock' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
        });
      }));

    it("previously locked waitable should run once it's unlocked", () =>
      runInDom(({ onMount }) => {
        const lock = useBinding(() => true, { id: 'lock' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          lock.set(false);

          await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
        });
      }));

    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const lock1 = useBinding(() => true, { id: 'lock1' });
        const lock2 = useBinding(() => true, { id: 'lock2' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: [lock1, lock2] });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          lock1.set(false);

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          lock2.set(false);

          await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
        });
      }));
  });

  describe('lockedUntil', () => {
    it("locked waitable shouldn't run", () =>
      runInDom(({ onMount }) => {
        const unlock = useConstBinding(false, { id: 'unlock' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
        });
      }));

    it("previously locked waitable should run once it's unlocked", () =>
      runInDom(({ onMount }) => {
        const unlock = useBinding(() => false, { id: 'unlock' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          unlock.set(true);

          await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
        });
      }));

    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const unlock1 = useBinding(() => false, { id: 'unlock1' });
        const unlock2 = useBinding(() => false, { id: 'unlock2' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedUntil: [unlock1, unlock2] });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          unlock1.set(true);

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          unlock2.set(true);

          await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
        });
      }));
  });

  describe('both lockedWhile and lockedUntil', () => {
    it('when multiple locks are used, all must be unlocked', () =>
      runInDom(({ onMount }) => {
        const lock = useBinding(() => true, { id: 'lock' });
        const unlock = useBinding(() => false, { id: 'unlock' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', lockedWhile: lock, lockedUntil: unlock });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          lock.set(false);

          await expect(waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalled())).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          unlock.set(true);

          await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
        });
      }));
  });
});

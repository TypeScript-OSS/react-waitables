import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../__test_dependency__';
import type { UseWaitableOnResetCallback } from '../types/args';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  describe('without default value', () => {
    it('hard reset waitables should be cleared and then resolved after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const echo = useBinding(() => 1, { id: 'echo' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(echo.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', hardResetBindings: [echo], onReset });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(50); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          echo.set(2);

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('hard');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await sleep(50); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(2);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));

    it('quickly changing multiple hard reset bindings should clear the waitable and then it should be resolved after being given enough time to run, but should once be run once', () =>
      runInDom(({ onMount }) => {
        const a = useBinding(() => 1, { id: 'a' });
        const b = useBinding(() => 2, { id: 'b' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(async ({ setSuccess }) => {
          await sleep(50);

          setSuccess(a.get() + b.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', hardResetBindings: [a, b], onReset });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(100); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(3);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          a.set(2);
          b.set(3);

          expect(onReset).toHaveBeenCalledTimes(2);
          expect(onReset).toHaveBeenCalledWith('hard');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await waitFor(() => expect(waitable.value.get()).toBe(5));

          expect(waitable.error.get()).toBeUndefined();
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));

    it('soft reset waitables should be not be cleared but should be updated with new values after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const echo = useBinding(() => 1, { id: 'echo' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(echo.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', softResetBindings: [echo], onReset });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(50); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          echo.set(2);

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('soft');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await sleep(50); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(2);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));
  });

  describe('without defaultValue=use-primary-function', () => {
    it('hard reset waitables should be cleared and then resolved after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const echo = useBinding(() => 1, { id: 'echo' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(echo.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, {
          id: 'test',
          hardResetBindings: [echo],
          onReset,
          defaultValue: 'use-primary-function'
        });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          echo.set(2);

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('hard');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(2);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);

          await expect(waitFor(() => expect(waitablePrimaryFunc).not.toHaveBeenCalledTimes(2))).rejects.toThrow();
        });
      }));

    it('quickly changing multiple hard reset bindings should clear the waitable and then it should be resolved after being given enough time to run, but should once be run once', () =>
      runInDom(({ onMount }) => {
        const a = useBinding(() => 1, { id: 'a' });
        const b = useBinding(() => 2, { id: 'b' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(async ({ setSuccess }) => {
          await sleep(50);

          setSuccess(a.get() + b.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, {
          id: 'test',
          hardResetBindings: [a, b],
          onReset,
          defaultValue: 'use-primary-function'
        });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(100); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(3);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          a.set(2);
          b.set(3);

          expect(onReset).toHaveBeenCalledTimes(2);
          expect(onReset).toHaveBeenCalledWith('hard');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(3);

          await expect(waitFor(() => expect(waitablePrimaryFunc).not.toHaveBeenCalledTimes(3))).rejects.toThrow();

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(5);
        });
      }));

    it('soft reset waitables should be not be cleared but should be updated with new values after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const echo = useBinding(() => 1, { id: 'echo' });
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(echo.get());
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, {
          id: 'test',
          softResetBindings: [echo],
          onReset,
          defaultValue: 'use-primary-function'
        });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          echo.set(2);

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('soft');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await sleep(50); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(2);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));

    it('manually hard reset waitables should be cleared and then resolved after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', onReset });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(50); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          waitable.reset('hard');

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('hard');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await sleep(50); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));

    it('manually soft reset waitables should be cleared and then resolved after being given enough time to run', () =>
      runInDom(({ onMount }) => {
        const waitablePrimaryFunc = jest.fn<WaitablePrimaryFunction<number>>(({ setSuccess }) => {
          setSuccess(1);
        });
        const onReset: UseWaitableOnResetCallback = jest.fn();
        const waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', onReset });

        onMount(async () => {
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBeUndefined();

          await sleep(50); // Giving the waitable a chance to run

          expect(onReset).not.toHaveBeenCalled();
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          waitable.reset('soft');

          expect(onReset).toHaveBeenCalledTimes(1);
          expect(onReset).toHaveBeenCalledWith('soft');
          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

          await sleep(50); // Giving the waitable a chance to run

          expect(waitable.error.get()).toBeUndefined();
          expect(waitable.value.get()).toBe(1);
          expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2);
        });
      }));
  });
});

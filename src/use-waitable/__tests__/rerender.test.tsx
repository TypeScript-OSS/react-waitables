import { waitFor } from '@testing-library/react';
import React, { ComponentType } from 'react';
import { BindingsConsumer, useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../__test_dependency__';
import type { Waitable } from '../../waitable/types/waitable';
import type { WaitablePrimaryFunction } from '../types/primary-function';
import { useWaitable } from '../use-waitable';

describe('useWaitable', () => {
  it("waitable shouldn't rerun unnecessarily on rerender", () =>
    runInDom(({ onMount }) => {
      const refresh = useBinding(() => 0, { id: 'refresh' });

      let waitable: Waitable<number> | undefined;

      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });

      const MyComponent: ComponentType = jest.fn(() => {
        waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test' });

        return <></>;
      });

      onMount(async () => {
        expect(waitable?.error.get()).toBeUndefined();
        expect(waitable?.value.get()).toBeUndefined();

        await waitFor(() => expect(waitable?.value.get()).toBe(1));

        expect(waitable?.error.get()).toBeUndefined();
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

        refresh.set(1);

        await expect(waitFor(() => expect(waitable?.value.get()).not.toBe(1))).rejects.toThrow();

        expect(waitable?.error.get()).toBeUndefined();
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);
        expect(MyComponent).toHaveBeenCalledTimes(2);
      });

      return <BindingsConsumer bindings={refresh}>{() => <MyComponent />}</BindingsConsumer>;
    }));

  it('waitable should rerun on rerender if deps change', () =>
    runInDom(({ onMount }) => {
      const refresh = useBinding(() => 0, { id: 'refresh' });

      let waitable: Waitable<number> | undefined;

      const waitablePrimaryFunc: WaitablePrimaryFunction<number> = jest.fn(async ({ setSuccess }) => {
        await sleep(50);
        setSuccess(1);
      });

      const MyComponent: ComponentType<{ value: number }> = jest.fn(({ value }: { value: number }) => {
        waitable = useWaitable<number>(waitablePrimaryFunc, { id: 'test', deps: [value] });

        return <></>;
      });

      onMount(async () => {
        expect(waitable?.error.get()).toBeUndefined();
        expect(waitable?.value.get()).toBeUndefined();

        await waitFor(() => expect(waitable?.value.get()).toBe(1));

        expect(waitable?.error.get()).toBeUndefined();
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(waitablePrimaryFunc).toHaveBeenCalledTimes(1);

        refresh.set(1);

        await waitFor(() => expect(waitablePrimaryFunc).toHaveBeenCalledTimes(2));

        expect(waitable?.error.get()).toBeUndefined();
        expect(MyComponent).toHaveBeenCalledTimes(2);
      });

      return <BindingsConsumer bindings={{ refresh }}>{({ refresh: value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});

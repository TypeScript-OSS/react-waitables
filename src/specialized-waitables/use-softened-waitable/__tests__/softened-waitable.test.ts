import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../../__test_dependency__';
import { useDerivedWaitable } from '../../exports';
import { useSoftenedWaitable } from '../use-softened-waitable';

describe('useSoftenedWaitable', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 1, { id: 'myBinding', detectChanges: true });
      const normalWaitable = useDerivedWaitable(
        myBinding,
        async (myBinding) => {
          await sleep(50);
          return myBinding + 1;
        },
        { id: 'normalWaitable' }
      );
      const softenedWaitable = useSoftenedWaitable(normalWaitable, { id: 'softenedWaitable' });

      onMount(async () => {
        await waitFor(() => expect(normalWaitable.value.get()).toBe(2));

        expect(softenedWaitable.value.get()).toBe(2);

        myBinding.set(2);

        expect(softenedWaitable.value.get()).toBe(2);

        expect(normalWaitable.value.get()).toBeUndefined();

        await waitFor(() => expect(normalWaitable.value.get()).toBe(3));

        expect(softenedWaitable.value.get()).toBe(3);

        normalWaitable.reset('hard');
        softenedWaitable.reset('hard');

        expect(softenedWaitable.value.get()).toBeUndefined();
      });
    }));
});

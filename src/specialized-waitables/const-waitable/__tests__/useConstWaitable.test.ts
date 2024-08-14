import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { useConstWaitable } from '../const-waitable.js';

describe('useConstWaitable', () => {
  it('without value or error should be incomplete', () =>
    runInDom(() => {
      const a = useConstWaitable({ id: 'a' });

      expect(a.isComplete.get()).toBeFalsy();
      expect(a.value.get()).toBeUndefined();
      expect(a.error.get()).toBeUndefined();
    }));

  it('with value should be complete with value', () =>
    runInDom(() => {
      const a = useConstWaitable({ id: 'a', value: 3.14 });

      expect(a.isComplete.get()).toBeTruthy();
      expect(a.value.get()).toEqual(3.14);
    }));

  it('with error should be complete with value', () =>
    runInDom(() => {
      const a = useConstWaitable<number, 'failed'>({ id: 'a', error: 'failed' });

      expect(a.isComplete.get()).toBeTruthy();
      expect(a.value.get()).toBeUndefined();
      expect(a.error.get()).toBe('failed');
    }));

  it('reset should do nothing', () =>
    runInDom(() => {
      const a = useConstWaitable({ id: 'a', value: 3.14 });

      expect(a.isComplete.get()).toBeTruthy();
      expect(a.value.get()).toEqual(3.14);

      a.reset('hard');

      expect(a.isComplete.get()).toBeTruthy();
      expect(a.value.get()).toEqual(3.14);

      a.reset('soft');

      expect(a.isComplete.get()).toBeTruthy();
      expect(a.value.get()).toEqual(3.14);
    }));

  it.skip('with value, wait should return immediately', () =>
    runInDom(({ onMount }) => {
      const a = useConstWaitable({ id: 'a', value: 3.14 });

      onMount(async () => {
        expect(await a.wait({ timeoutMSec: 10 })).toBe('success');

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toEqual(3.14);
      });
    }));

  describe('with forced ok value', () => {
    it('without value or error', () =>
      runInDom(() => {
        const a = useConstWaitable({ id: 'a' });

        a.force.set({ ok: true, value: 6.28 });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toEqual(6.28);
        expect(a.error.get()).toBeUndefined();
      }));

    it('with value', () =>
      runInDom(() => {
        const a = useConstWaitable({ id: 'a', value: 3.14 });

        a.force.set({ ok: true, value: 6.28 });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toEqual(6.28);
      }));

    it('with error', () =>
      runInDom(() => {
        const a = useConstWaitable<number, 'failed'>({ id: 'a', error: 'failed' });

        a.force.set({ ok: true, value: 6.28 });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toEqual(6.28);
        expect(a.error.get()).toBeUndefined();
      }));
  });

  describe('with forced not ok value', () => {
    it('without value or error', () =>
      runInDom(() => {
        const a = useConstWaitable<number, 'failed'>({ id: 'a' });

        a.force.set({ ok: false, value: 'failed' });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toBeUndefined();
        expect(a.error.get()).toBe('failed');
      }));

    it('with value', () =>
      runInDom(() => {
        const a = useConstWaitable<number, 'failed'>({ id: 'a', value: 3.14 });

        a.force.set({ ok: false, value: 'failed' });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toBeUndefined();
        expect(a.error.get()).toBe('failed');
      }));

    it('with error', () =>
      runInDom(() => {
        const a = useConstWaitable<number, 'failed'>({ id: 'a', error: 'failed' });

        a.force.set({ ok: false, value: 'failed' });

        expect(a.isComplete.get()).toBeTruthy();
        expect(a.value.get()).toBeUndefined();
        expect(a.error.get()).toBe('failed');
      }));
  });
});

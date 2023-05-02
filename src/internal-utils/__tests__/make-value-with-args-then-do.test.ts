import { jest } from '@jest/globals';

import { sleep } from '../../__test_dependency__';
import { makeValueWithArgsThenDo } from '../make-value-with-args-then-do';

describe('makeValueWithArgsThenDo', () => {
  describe('synchronous makeValue functions', () => {
    it('should result in then function being called synchronously', () => {
      const thenFunc = jest.fn();
      makeValueWithArgsThenDo((value) => value, [1], thenFunc);
      expect(thenFunc).toHaveBeenLastCalledWith(1);
    });

    it('that throw should result in then function being called synchronously but without a value', () => {
      const thenFunc = jest.fn();
      expect(() => {
        makeValueWithArgsThenDo(
          (_value) => {
            throw new Error();
          },
          [1],
          thenFunc
        );
      }).toThrow();
      expect(thenFunc).toHaveBeenLastCalledWith();
    });
  });

  describe('asynchronous makeValue functions', () => {
    it('should result in then function being called asynchronously', async () => {
      const thenFunc = jest.fn();
      const promise = makeValueWithArgsThenDo(
        async (value) => {
          await sleep(100);

          return value;
        },
        [1],
        thenFunc
      );
      expect(thenFunc).not.toHaveBeenCalled();
      await promise;
      expect(thenFunc).toHaveBeenLastCalledWith(1);
    });

    it('that throw should result in then function being called asynchronously but without a value', async () => {
      const thenFunc = jest.fn();
      const promise = expect(
        makeValueWithArgsThenDo(
          async (_value) => {
            await sleep(100);

            throw new Error();
          },
          [1],
          thenFunc
        )
      ).rejects.toThrow();
      expect(thenFunc).not.toHaveBeenCalled();
      await promise;
      expect(thenFunc).toHaveBeenLastCalledWith();
    });
  });
});

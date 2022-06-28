import React from 'react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../../__test_dependency__';
import { useDerivedWaitable } from '../../../specialized-waitables/use-derived-waitable/use-derived-waitable';
import { useWaitableFunction } from '../../../specialized-waitables/use-waitable-function';
import { WaitablesConsumer } from '../WaitablesConsumer';

describe('WaitablesConsumer', () => {
  it('should work with both named binding and waitables', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useWaitableFunction(
        async () => {
          await sleep(50);
          return { ok: true, value: 2 };
        },
        { id: 'b' }
      );
      const c = useDerivedWaitable({ a, b }, ({ a, b }) => a + b, { id: 'c' });

      onMount(async (rootElement) => {
        expect(rootElement.innerHTML).toBe('');

        await sleep(300);

        expect(rootElement.innerHTML).toBe('<div><span>1</span>+<span>2</span>=<span>3</span></div>');
      });

      return (
        <WaitablesConsumer dependencies={{ a, b, c }}>
          {({ a, b, c }) => (
            <div>
              <span>{a}</span>+<span>{b}</span>=<span>{c}</span>
            </div>
          )}
        </WaitablesConsumer>
      );
    }));
});

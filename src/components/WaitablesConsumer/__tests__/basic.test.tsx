import { waitFor } from '@testing-library/react';
import React from 'react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../../__test_dependency__/index.js';
import { useDerivedWaitable } from '../../../specialized-waitables/use-derived-waitable/use-derived-waitable.js';
import { useWaitableFunction } from '../../../specialized-waitables/use-waitable-function.js';
import { WaitablesConsumer } from '../WaitablesConsumer.js';

describe('WaitablesConsumer', () => {
  it('should work with undefined dependencies', () =>
    runInDom(({ onMount }) => {
      onMount(async (rootElement) => {
        expect(rootElement.innerHTML).toBe('<div><div></div></div>');
      });

      return (
        <WaitablesConsumer dependencies={undefined}>
          {(values) => {
            expect(values).toBeUndefined();

            return <div />;
          }}
        </WaitablesConsumer>
      );
    }));

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
        expect(rootElement.innerHTML).toBe('<div></div>');
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><div><span>1</span>+<span>2</span>=<span>3</span></div></div>'));
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

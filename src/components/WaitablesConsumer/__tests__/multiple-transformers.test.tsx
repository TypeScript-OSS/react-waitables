import { waitFor } from '@testing-library/react';
import React from 'react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../../__test_dependency__/index.js';
import { useDerivedWaitable } from '../../../specialized-waitables/use-derived-waitable/use-derived-waitable.js';
import { useWaitableFunction } from '../../../specialized-waitables/use-waitable-function.js';
import { WaitablesConsumer } from '../WaitablesConsumer.js';

describe('WaitablesConsumer', () => {
  it('with multiple transformers as children should use the first applicable one', () =>
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
        expect(rootElement.innerHTML).toBe('<div><span>loading</span></div>');
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><div><span>1</span>+<span>2</span>=<span>3</span></div></div>'));
      });

      return (
        <WaitablesConsumer dependencies={{ a, b, c }}>
          {[
            ({ a, b, c }) => (
              <div>
                <span>{a}</span>+<span>{b}</span>=<span>{c}</span>
              </div>
            ),
            { ifLoading: () => <span>loading</span> }
          ]}
        </WaitablesConsumer>
      );
    }));

  it('with multiple transformers, mixed as children and props, should use the first applicable one where children take precedence over props', () =>
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
        expect(rootElement.innerHTML).toBe('<div><span>loading</span></div>');
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><div><span>1</span>+<span>2</span>=<span>3</span></div></div>'));
      });

      return (
        <WaitablesConsumer dependencies={{ a, b, c }} ifLoading={() => <span>loading</span>}>
          {({ a, b, c }) => (
            <div>
              <span>{a}</span>+<span>{b}</span>=<span>{c}</span>
            </div>
          )}
        </WaitablesConsumer>
      );
    }));
});

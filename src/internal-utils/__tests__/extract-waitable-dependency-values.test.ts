import { waitFor } from '@testing-library/react';
import { makeConstBinding } from 'react-bindings';

import { runInDom, sleep } from '../../__test_dependency__';
import { useWaitableFunction } from '../../specialized-waitables/use-waitable-function';
import { extractOptionalWaitableDependencyValues } from '../extract-waitable-dependency-values';

describe('extractOptionalWaitableDependencyValues', () => {
  it('undefined dependencies should work', () => {
    expect(extractOptionalWaitableDependencyValues({ dependencies: undefined, namedDependencyKeys: undefined })).toMatchObject({
      allWaitablesAreLoaded: true,
      anyWaitablesHadErrors: false,
      lastError: undefined,
      values: {}
    });
  });

  it('single bindings should work', () => {
    expect(
      extractOptionalWaitableDependencyValues({
        dependencies: makeConstBinding(3, { id: 'test' }),
        namedDependencyKeys: undefined
      })
    ).toMatchObject({
      allWaitablesAreLoaded: true,
      anyWaitablesHadErrors: false,
      lastError: undefined,
      values: 3
    });
  });

  it('single waitables should work', () =>
    runInDom(({ onMount }) => {
      const waitable = useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: waitable,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: undefined
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: waitable,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: 3
          })
        );
      });
    }));

  it('single waitables with errors should work', () =>
    runInDom(({ onMount }) => {
      const waitable = useWaitableFunction(() => ({ ok: false, value: 3 }), { id: 'test' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: waitable,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: undefined
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: waitable,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: false,
            anyWaitablesHadErrors: true,
            lastError: 3,
            values: undefined
          })
        );
      });
    }));

  it('arrays of bindings should work', () => {
    const dependencies = [makeConstBinding(3, { id: 'test1' }), makeConstBinding('hello', { id: 'test2' })];

    expect(
      extractOptionalWaitableDependencyValues({
        dependencies,
        namedDependencyKeys: undefined
      })
    ).toMatchObject({
      allWaitablesAreLoaded: true,
      anyWaitablesHadErrors: false,
      lastError: undefined,
      values: [3, 'hello']
    });
  });

  it('arrays of waitables should work', () =>
    runInDom(({ onMount }) => {
      const dependencies = [
        useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1', defaultValue: () => 5 }),
        useWaitableFunction(() => ({ ok: true, value: 'hello' }), { id: 'test2', defaultValue: () => 'world' })
      ];

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: true,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [5, 'world']
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: [3, 'hello']
          })
        );
      });
    }));

  it('arrays of incomplete waitables should work', () =>
    runInDom(({ onMount }) => {
      const dependencies = [
        useWaitableFunction(
          async () => {
            await sleep(50);

            return { ok: true, value: 3 };
          },
          { id: 'test1' }
        ),
        useWaitableFunction(() => ({ ok: true, value: 'hello' }), { id: 'test2' })
      ];

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [undefined, undefined]
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: [3, 'hello']
          })
        );
      });
    }));

  it('arrays of waitables with errors should work', () =>
    runInDom(({ onMount }) => {
      const dependencies = [
        useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1' }),
        useWaitableFunction(() => ({ ok: false, value: 'hello' }), { id: 'test2' })
      ];

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [undefined, undefined]
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: false,
            anyWaitablesHadErrors: true,
            lastError: 'hello',
            values: [3, undefined]
          })
        );
      });
    }));

  it('arrays of waitables and bindings together should work', () =>
    runInDom(({ onMount }) => {
      const dependencies = [
        useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1' }),
        makeConstBinding('hello', { id: 'test2' })
      ];

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [undefined, 'hello']
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: [3, 'hello']
          })
        );
      });
    }));

  it('undefined values in arrays of waitables and bindings together should work', () =>
    runInDom(({ onMount }) => {
      const one = useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1' });
      const three = makeConstBinding('hello', { id: 'test2' });

      const dependencies = [one, undefined, three];

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies,
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [undefined, undefined, 'hello']
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies,
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: [3, undefined, 'hello']
          })
        );
      });
    }));

  it('binding tuples should work', () => {
    expect(
      extractOptionalWaitableDependencyValues({
        dependencies: [makeConstBinding(3, { id: 'test1' }), makeConstBinding('hello', { id: 'test2' })],
        namedDependencyKeys: undefined
      })
    ).toMatchObject({
      allWaitablesAreLoaded: true,
      anyWaitablesHadErrors: false,
      lastError: undefined,
      values: [3, 'hello']
    });
  });

  it('tuples of bindings and waitables should work', () =>
    runInDom(({ onMount }) => {
      const one = useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1' });
      const two = makeConstBinding('hello', { id: 'test2' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: [one, two],
          namedDependencyKeys: undefined
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: [undefined, 'hello']
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: [one, two],
              namedDependencyKeys: undefined
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: [3, 'hello']
          })
        );
      });
    }));

  it('named bindings should work', () => {
    const one = makeConstBinding(3, { id: 'test1' });
    const two = makeConstBinding('hello', { id: 'test2' });

    expect(
      extractOptionalWaitableDependencyValues({
        dependencies: { one, two },
        namedDependencyKeys: ['one', 'two']
      })
    ).toMatchObject({
      allWaitablesAreLoaded: true,
      anyWaitablesHadErrors: false,
      lastError: undefined,
      values: { one: 3, two: 'hello' }
    });
  });

  it('named waitables should work', () =>
    runInDom(({ onMount }) => {
      const one = useWaitableFunction(() => ({ ok: true, value: 3 }), { id: 'test1' });
      const two = useWaitableFunction(() => ({ ok: true, value: 'hello' }), { id: 'test2' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: { one, two },
          namedDependencyKeys: ['one', 'two']
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: { one: undefined, two: undefined }
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: { one, two },
              namedDependencyKeys: ['one', 'two']
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: { one: 3, two: 'hello' }
          })
        );
      });
    }));

  it('named waitables and bindings should work', () =>
    runInDom(({ onMount }) => {
      const one = makeConstBinding(3, { id: 'test1' });
      const two = useWaitableFunction(() => ({ ok: true, value: 'hello' }), { id: 'test2' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: { one, two },
          namedDependencyKeys: ['one', 'two']
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: { one: 3, two: undefined }
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: { one, two },
              namedDependencyKeys: ['one', 'two']
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: { one: 3, two: 'hello' }
          })
        );
      });
    }));

  it('incomplete named waitables and bindings should work', () =>
    runInDom(({ onMount }) => {
      const one = makeConstBinding(3, { id: 'test1' });
      const two = useWaitableFunction(
        async () => {
          await sleep(50);

          return { ok: true, value: 'hello' };
        },
        { id: 'test2' }
      );

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: { one, two },
          namedDependencyKeys: ['one', 'two']
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: { one: 3, two: undefined }
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: { one, two },
              namedDependencyKeys: ['one', 'two']
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: { one: 3, two: 'hello' }
          })
        );
      });
    }));

  it('named waitables with errors and bindings should work', () =>
    runInDom(({ onMount }) => {
      const one = makeConstBinding(3, { id: 'test1' });
      const two = useWaitableFunction(() => ({ ok: false, value: 'hello' }), { id: 'test2' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: { one, two },
          namedDependencyKeys: ['one', 'two']
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: { one: 3, two: undefined }
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: { one, two },
              namedDependencyKeys: ['one', 'two']
            })
          ).toMatchObject({
            allWaitablesAreLoaded: false,
            anyWaitablesHadErrors: true,
            lastError: 'hello',
            values: { one: 3, two: undefined }
          })
        );
      });
    }));

  it('undefined values in named waitables and bindings should work', () =>
    runInDom(({ onMount }) => {
      const one = makeConstBinding(3, { id: 'test1' });
      const two = useWaitableFunction(() => ({ ok: true, value: 'hello' }), { id: 'test2' });

      expect(
        extractOptionalWaitableDependencyValues({
          dependencies: { one, two, three: undefined },
          namedDependencyKeys: ['one', 'two', 'three']
        })
      ).toMatchObject({
        allWaitablesAreLoaded: false,
        anyWaitablesHadErrors: false,
        lastError: undefined,
        values: { one: 3, two: undefined, three: undefined }
      });

      onMount(async () => {
        await waitFor(() =>
          expect(
            extractOptionalWaitableDependencyValues({
              dependencies: { one, two, three: undefined },
              namedDependencyKeys: ['one', 'two', 'three']
            })
          ).toMatchObject({
            allWaitablesAreLoaded: true,
            anyWaitablesHadErrors: false,
            lastError: undefined,
            values: { one: 3, two: 'hello', three: undefined }
          })
        );
      });
    }));
});

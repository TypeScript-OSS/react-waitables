# react-waitables

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Async Data Bindings for React

Waitables represent asynchronous functionality that can be observed and controlled in a variety of ways.  Waitables are built on top of Bindings and the concepts in [react-bindings](https://www.npmjs.com/package/react-bindings).

With waitables, we can:

- wait for a value or error to be produced or modified
- re-execute automatically when certain conditions are met, or manually on demand
- prevent execution under certain conditions
- derive values from other synchronously or asynchronously produced values, including from bindings and waitables

## Basic Example

In the following example, we demonstrate creating a waitable function that generates a random value after a 1 second delay.  We also add a button that, when clicked, "hard" resets the waitable.

When a waitable is hard reset, any previous values are cleared and the primary function is re-executed.

We also demonstrate logging and observing changes and using `WaitablesConsumer` to dynamically render content dependent on the waitable's value.

`WaitablesConsumer` supports using different renderers depending on the overall state of the dependencies ("loaded", "loading", or "error").  In the following example, we demonstrate two of the possible state renderer options: "loading" and "loaded" (implicitly represented by the child function).

[Try it Out – CodeSandbox](https://codesandbox.io/s/great-golick-h1z9vu)

```typescript
import React from 'react';
import { useBindingEffect } from 'react-bindings';
import { useWaitableFunction, WaitablesConsumer } from 'react-waitables';

export const MyComponent = () => {
  const myWaitable = useWaitableFunction(
    async () => {
      // Sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Generate a random 0-99 value
      return { ok: true, value: Math.floor(Math.random() * 100) };
    },
    { id: 'myWaitable' }
  );

  // Getting and logging the value of the waitable.  The value will be undefined because it takes about 1 second to generate since we're
  // sleeping for 1 second in the producer function
  console.log('myWaitable value', myWaitable.value.get()); // myWaitable value undefined

  // Logging the other waitable state information
  console.log('myWaitable error', myWaitable.error.get()); // myWaitable error undefined
  console.log('myWaitable isComplete', myWaitable.isComplete.get()); // myWaitable isComplete false
  // The waitable won't have started execution yet, at least not on the first render of MyComponent
  console.log('myWaitable isBusy', myWaitable.isBusy.get()); // myWaitable isBusy false

  // Registering a callback that will be triggered anytime the value binding changes, while this component is mounted.
  // By default, these calls are debounced.
  useBindingEffect({ value: myWaitable.value }, ({ value }) => {
    console.log('myWaitable value', value);
  });

  const onUpdateClick = () => myWaitable.reset('hard');

  // The rendered component includes a portion that will be automatically rerendered whenever the waitable changes.
  // By default, these rerenders are debounced.
  return (
    <div>
      myWaitable value:&nbsp;
      <WaitablesConsumer dependencies={{ value: myWaitable }} ifLoading={() => 'loading…'}>
        {({ value }) => value}
      </WaitablesConsumer>
      &nbsp;
      <button onClick={onUpdateClick}>Update</button>
    </div>
  );
};
```

Waitables are even more interesting when associated with dynamically loaded content or when they're chained together with other waitables and bindings.

## Another Example

In the following example, we use `fetch` to load data dynamically, setting the value or error of the waitable depending on if the request succeeds or fails.

We also create a second waitable derived from the first waitable and another binding, which we use to choose between rendering the type of the data in all caps or lowercase.

[Try it Out – CodeSandbox](https://codesandbox.io/s/epic-microservice-vmvrdd)

```typescript
import React from 'react';
import { BindingsConsumer, useBinding } from 'react-bindings';
import { useDerivedWaitable, useWaitableFunction, WaitablesConsumer } from 'react-waitables';

export const MyComponent = () => {
  const myWaitable = useWaitableFunction(
    async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json');
        const data = await response.json();
        if (data !== undefined) {
          return { ok: true, value: data };
        } else {
          return { ok: false, value: { status: response.status } };
        }
      } catch (error) {
        return { ok: false, value: { error } };
      }
    },
    { id: 'myWaitable' }
  );

  const onTryAgainClick = () => myWaitable.reset('hard');

  const allCaps = useBinding(() => false, { id: 'allCaps' });
  const toggleAllCaps = () => allCaps.set(!allCaps.get());

  const myWaitableType = useDerivedWaitable(
    { allCaps, myWaitable },
    ({ allCaps, myWaitable }) => {
      const type: string = typeof myWaitable;
      return allCaps ? type.toLocaleUpperCase() : type.toLocaleLowerCase();
    },
    { id: 'myWaitableType' }
  );

  // The rendered component includes three dynamic portions.
  //
  // The first presents the value of the loaded data as stringified JSON.  If the data isn't loaded yet, it shows a loading message.  If an
  // error has occurred, it shows an error indicator message and a button that lets users retry.
  //
  // The second dynamic portion renders the type of data that was returned, either in all caps or lowercase.
  //
  // The final dynamic portion is the label on the button, which changes to let users know the effect of clicking the button.
  return (
    <>
      <div>
        myWaitable value:&nbsp;
        <WaitablesConsumer
          dependencies={{ value: myWaitable }}
          ifLoading={() => 'loading…'}
          ifError={() => (
            <>
              <span>something went wrong&nbsp;</span>
              <button onClick={onTryAgainClick}>Try Again</button>
            </>
          )}
        >
          {({ value }) => JSON.stringify(value)}
        </WaitablesConsumer>
      </div>
      <div>
        <WaitablesConsumer dependencies={{ type: myWaitableType }}>{({ type }) => <span>&nbsp;({type})</span>}</WaitablesConsumer>
      </div>
      <div>
        <button onClick={toggleAllCaps}>
          <BindingsConsumer bindings={{ allCaps }}>
            {({ allCaps }) => (allCaps ? 'Switch to Lowercase' : 'Switch to Uppercase')}
          </BindingsConsumer>
        </button>
      </div>
    </>
  );
};
```

## Default Value Example

Instead of returning an undefined value by default, your waitables can synchronously or asynchronously compute a more useful default, as
demonstrated in the following example (based on the first example from above):

```typescript
const myWaitable = useWaitableFunction(
  async () => {
    // Sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Generate a random 0-99 value
    return { ok: true, value: Math.floor(Math.random() * 100) };
  },
  { id: 'myWaitable', defaultValue: () => 0 }
);
```

Get creative and consider using waitables with React contexts, inside hooks, and extending them using the `addFields` option.

[API Docs](https://typescript-oss.github.io/react-waitables/)

## Thanks

Thanks for checking it out.  Feel free to create issues or otherwise provide feedback.

Be sure to check out our other [TypeScript OSS](https://github.com/TypeScript-OSS) projects as well.

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/react-waitables.svg

[downloads]: https://www.npmjs.com/package/react-waitables

[size-badge]: https://img.shields.io/bundlephobia/minzip/react-waitables.svg

[size]: https://bundlephobia.com/result?p=react-waitables

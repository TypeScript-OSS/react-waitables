import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { areAnyBindingsTruthy } from '../are-any-bindings-truthy.js';

describe('areAnyBindingsTruthy', () => {
  it('should return true if all bindings have truthy values', () =>
    runInDom(() => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useBinding(() => 2, { id: 'b' });
      const c = useBinding(() => 3, { id: 'c' });
      expect(areAnyBindingsTruthy([a, b, c])).toBeTruthy();
    }));

  it('should return true if one but not all bindings have truthy values', () =>
    runInDom(() => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useBinding(() => 0, { id: 'b' });
      const c = useBinding(() => 3, { id: 'c' });
      expect(areAnyBindingsTruthy([a, b, c])).toBeTruthy();
    }));

  it('should return false if all bindings have falsey values', () =>
    runInDom(() => {
      const a = useBinding(() => false, { id: 'a' });
      const b = useBinding(() => 0, { id: 'b' });
      const c = useBinding(() => null, { id: 'c' });
      expect(areAnyBindingsTruthy([a, b, c])).toBeFalsy();
    }));
});

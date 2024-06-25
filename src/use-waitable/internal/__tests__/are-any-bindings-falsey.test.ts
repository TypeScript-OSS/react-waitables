import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/index.js';
import { areAnyBindingsFalsey } from '../are-any-bindings-falsey.js';

describe('areAnyBindingsFalsey', () => {
  it('should return false if all bindings have truthy values', () =>
    runInDom(() => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useBinding(() => 2, { id: 'b' });
      const c = useBinding(() => 3, { id: 'c' });
      expect(areAnyBindingsFalsey([a, b, c])).toBeFalsy();
    }));

  it('should return true if one but not all bindings have falsey values', () =>
    runInDom(() => {
      const a = useBinding(() => 1, { id: 'a' });
      const b = useBinding(() => 0, { id: 'b' });
      const c = useBinding(() => 3, { id: 'c' });
      expect(areAnyBindingsFalsey([a, b, c])).toBeTruthy();
    }));

  it('should return true if all bindings have falsey values', () =>
    runInDom(() => {
      const a = useBinding(() => false, { id: 'a' });
      const b = useBinding(() => 0, { id: 'b' });
      const c = useBinding(() => null, { id: 'c' });
      expect(areAnyBindingsFalsey([a, b, c])).toBeTruthy();
    }));
});

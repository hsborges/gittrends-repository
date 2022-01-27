import { isEqual } from 'lodash';

import normalize from './normalize';

describe('Normalize response received from GitHub API', () => {
  test('it should transform date strings to objects', () => {
    const date = new Date();
    expect(isEqual({ tested_at: date }, normalize({ tested_at: date.toISOString() }))).toBe(true);
    expect(isEqual({ tested_on: date }, normalize({ tested_on: date.toISOString() }))).toBe(true);
    expect(isEqual({ date: date }, normalize({ date: date.toISOString() }))).toBe(true);
    expect(isEqual([{ date: date }], normalize([{ date: date.toISOString() }]))).toBe(true);
  });

  test('it should transform object keys to snake case', () => {
    expect(normalize({ a: 1 })).toStrictEqual({ a: 1 });
    expect(normalize({ aA: 1 })).toStrictEqual({ a_a: 1 });
    expect(normalize({ aA: { bB: 'cC' } })).toStrictEqual({ a_a: { b_b: 'cC' } });
    expect(normalize({ aA: { bB: [{ cC: 1 }] } })).toStrictEqual({ a_a: { b_b: [{ c_c: 1 }] } });
  });

  test('it should spread single properties', () => {
    expect(normalize({ totalCount: 1 })).toStrictEqual(1);
    expect(normalize({ a: { totalCount: 1 } })).toStrictEqual({ a: 1 });
    expect(normalize({ a: { total_count: 1 } })).toStrictEqual({ a: 1 });
    expect(normalize({ a: [{ totalCount: 1 }] })).toStrictEqual({ a: [1] });

    expect(normalize({ a: { id: 1 } })).toStrictEqual({ a: 1 });
    expect(normalize({ a: { id: 1, name: 2 } })).toStrictEqual({ a: { id: 1, name: 2 } });
    expect(normalize({ a: { name: 1 } })).toStrictEqual({ a: 1 });
    expect(normalize({ a: { target: 1 } })).toStrictEqual({ a: 1 });
  });

  test('it should normalize reaction_groups data', () => {
    expect(
      normalize({
        reaction_groups: [
          { content: 'HEART', users: 10 },
          { content: 'THUMBS_UP', users: 5 }
        ]
      })
    ).toStrictEqual({
      reaction_groups: { heart: 10, thumbs_up: 5 }
    });
  });
});

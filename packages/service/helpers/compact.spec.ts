import compact from './compact';

describe('Compact objects by removing nullable values', () => {
  it('should compact array objects', () => {
    expect(compact([])).toHaveLength(0);
    expect(compact([{}])).toHaveLength(0);
    expect(compact([{ a: null }])).toHaveLength(0);
    expect(compact([{ a: [null, undefined, '', {}, []] }])).toHaveLength(0);
    expect(compact([null, undefined, '', {}, []])).toHaveLength(0);
    expect(compact(['valid', { value: true }, { notThisOne: null }])).toHaveLength(2);
  });

  it('should compact plain objects', () => {
    expect(compact({})).toStrictEqual({});
    expect(compact({ empty: {} })).toStrictEqual({});
    expect(compact({ empty: [] })).toStrictEqual({});
    expect(compact({ empty: undefined })).toStrictEqual({});
    expect(compact({ empty: [null, undefined, '', {}, []] })).toStrictEqual({});
    expect(compact(['valid', { value: true }])).toHaveLength(2);
    expect(compact({ valid: { property: true }, notThisOne: null })).toStrictEqual({
      valid: { property: true }
    });
  });

  it('should not change other values', () => {
    expect(compact(1)).toBe(1);
    expect(compact(null)).toBe(null);

    const date = new Date();
    expect(compact(date)).toBe(date);
    expect(compact(date.toISOString())).toBe(date.toISOString());
  });
});

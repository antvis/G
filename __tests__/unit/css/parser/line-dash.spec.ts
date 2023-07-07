import { parseDimensionArray } from '../../../../packages/g-lite/src/css';

describe('Property LineDash', () => {
  it('parse lineDash with unit', () => {
    let result = parseDimensionArray('10px 10px');
    expect(result[0].toString()).toBe('10px');
    expect(result[1].toString()).toBe('10px');

    result = parseDimensionArray('10 10');
    expect(result[0].toString()).toBe('10px');
    expect(result[1].toString()).toBe('10px');

    result = parseDimensionArray('10px 10%');
    expect(result[0].toString()).toBe('10px');
    expect(result[1].toString()).toBe('10%');

    // expect(parseDimensionArray('10 10')).toStrictEqual([10, 10]);
    // expect(parseDimensionArray('10')).toStrictEqual([10, 10]);
    // expect(parseDimensionArray([10, 10])).toStrictEqual([10, 10]);
    // expect(parseDimensionArray([10])).toStrictEqual([10, 10]);

    // omit some segments
    // expect(parseLineDash('10px 20px 30px')).toStrictEqual([10, 20]);
    // expect(parseLineDash([10, 20, 30])).toStrictEqual([10, 20]);
  });
});

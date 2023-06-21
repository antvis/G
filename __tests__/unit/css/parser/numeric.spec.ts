import {
  clampedMergeNumbers,
  mergeNumberLists,
  mergeNumbers,
  numberToString,
  parseNumber,
  parseNumberList,
} from '../../../../packages/g-lite/src/css';

describe('Property Numeric', () => {
  it('should parse single numeric value correctly.', () => {
    expect(numberToString(10).toString()).toBe('10');

    expect(parseNumber(2).toString()).toBe('2');
    expect(parseNumber('2').toString()).toBe('2');
    expect(parseNumber('2.5').toString()).toBe('2.5');
    expect(parseNumber('xxxx').toString()).toBe('0');
  });

  it('should parse numeric list correctly.', () => {
    expect(parseNumberList('1 2 3').length).toBe(3);
    expect(parseNumberList([1, 2, 3]).length).toBe(3);
  });

  it('should merge numeric values correctly.', () => {
    const [left, right, toString] = mergeNumbers(1, 2);
    expect(left).toBe(1);
    expect(right).toBe(2);
    expect(toString(1)).toBe('1');
  });

  it('should clamp and merge numeric values correctly.', () => {
    const mergeFunc = clampedMergeNumbers(0, 10);
    const [left, right, toString] = mergeFunc(-1, 20);
    expect(left).toBe(-1);
    expect(right).toBe(20);
    expect(toString(-1)).toBe('0');
    expect(toString(5)).toBe('5');
    expect(toString(20)).toBe('10');
  });

  it('should merge numeric list values correctly.', () => {
    const [left, right, toString] = mergeNumberLists([1], [2])!;
    expect(left).toStrictEqual([1]);
    expect(right).toStrictEqual([2]);
    expect(toString([5])).toStrictEqual([5]);

    const returnValue = mergeNumberLists([1, 2], [2]);
    expect(returnValue).toBeUndefined();
  });
});

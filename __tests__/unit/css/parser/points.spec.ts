import { mergePoints, parsePoints } from '../../../../packages/g-lite/src/css';

describe('Property Points', () => {
  it('should parse points correctly', () => {
    let result = parsePoints('10,10 10,20 10,30');
    expect(result.points).toStrictEqual([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.totalLength).toBe(0);
    expect(result.segments).toStrictEqual([]);

    result = parsePoints([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.points).toStrictEqual([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.totalLength).toBe(0);
    expect(result.segments).toStrictEqual([]);
  });

  it('should merge points correctly.', () => {
    const points1 = parsePoints('10,10 10,20 10,30');
    const points2 = parsePoints('10,40 10,50 10,60');

    const [left, right] = mergePoints(points1, points2)!;

    expect(left).toStrictEqual([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(right).toStrictEqual([
      [10, 40],
      [10, 50],
      [10, 60],
    ]);
  });
});

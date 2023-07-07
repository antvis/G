import { mergePoints, parsePoints } from '../../../../packages/g-lite/src/css';

describe('Property Points', () => {
  it('should parse points correctly', () => {
    let result = parsePoints('10,10 10,20 10,30');
    expect(result.points).toStrictEqual([
      [10, 10],
      [10, 20],
      [10, 30],
    ]);
    expect(result.totalLength).toBe(20);
    expect(result.segments).toStrictEqual([
      [0, 0.5],
      [0.5, 1],
    ]);

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
    expect(result.totalLength).toBe(20);
    expect(result.segments).toStrictEqual([
      [0, 0.5],
      [0.5, 1],
    ]);
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

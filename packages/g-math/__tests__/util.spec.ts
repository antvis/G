import {
  angleAtSegments,
  distanceAtSegment,
  pointAtSegments,
} from '../src/segments';
import { distance, getBBoxByArray, getBBoxRange } from '../src/util';

describe('util test', () => {
  it('distance', () => {
    expect(distance(1, 1, 10, 1)).toBe(9);
  });

  it('point at segments 2 point', () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 100],
      [200, 200],
    ];
    expect(pointAtSegments(points, -1)).toBe(null);
    expect(pointAtSegments(points, 1.2)).toBe(null);
    expect(pointAtSegments(points, 0.5)).toBe({ x: 100, y: 100 });
    expect(pointAtSegments(points, 0)).toBe({ x: 0, y: 0 });
    expect(pointAtSegments(points, 1)).toBe({ x: 200, y: 200 });
  });

  it('point at segments 5 point', () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 100],
      [200, 200],
      [300, 100],
      [400, 0],
    ];
    expect(pointAtSegments(points, -1)).toBe(null);
    expect(pointAtSegments(points, 1.2)).toBe(null);
    expect(pointAtSegments(points, 0.5)).toBe({ x: 200, y: 200 });
    expect(pointAtSegments(points, 0)).toBe({ x: 0, y: 0 });
    expect(pointAtSegments(points, 1)).toBe({ x: 400, y: 0 });
    expect(pointAtSegments(points, 0.25)).toBe({ x: 100, y: 100 });
  });

  it('point at segements, overlapping', () => {
    // 测试重合点
    expect(
      pointAtSegments(
        [
          [1, 1],
          [1, 1],
        ],
        0.5,
      ),
    ).toBe({ x: 1, y: 1 });
  });
  it('angle at segment', () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 100],
      [200, 200],
      [300, 100],
      [400, 0],
    ];
    expect(angleAtSegments(points, -1)).toBe(0);
    expect(angleAtSegments(points, 1.2)).toBe(0);
    expect(angleAtSegments(points, 0.5)).toBe(Math.PI / 4);
    expect(angleAtSegments(points, 1)).toBe((Math.PI / 4) * -1);
  });

  it('angle at segement, special', () => {
    expect(angleAtSegments([[0, 0]], 0.5)).toBe(0);
    expect(
      angleAtSegments(
        [
          [1, 1],
          [1, 1],
        ],
        0.5,
      ),
    ).toBe(0);
  });

  it('distance at segment', () => {
    // 矩形
    const points: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
      [0, 0],
    ];
    expect(distanceAtSegment(points, 10, 10)).toBe(10);
    expect(distanceAtSegment(points, 10, 0)).toBe(0);
    expect(distanceAtSegment(points, 110, 110)).toBe(distance(0, 0, 10, 10));
  });

  it('getBBoxByArray', () => {
    expect(getBBoxByArray([2, 4, 6], [3, 5, 7])).toBe({
      x: 2,
      y: 3,
      width: 4,
      height: 4,
    });
  });

  it('getBBoxRange', () => {
    expect(getBBoxRange(1, 2, 3, 4)).toBe({
      minX: 1,
      maxX: 3,
      minY: 2,
      maxY: 4,
    });
  });
});

import polygon from '../src/polygon';
import { distance } from '../src/util';

describe('test polygon', () => {
  // 三角形
  const points1: [number, number][] = [
    [50, 0],
    [100, 100],
    [0, 100],
  ];
  // 矩形
  const points2: [number, number][] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ];

  it('box', () => {
    expect(polygon.box(points1)).toBe({ x: 0, y: 0, width: 100, height: 100 });
    expect(polygon.box(points2)).toBe({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('length', () => {
    expect(polygon.length(points1)).toBe(distance(50, 0, 100, 100) * 2 + 100);
    expect(polygon.length(points2)).toBe(400);
  });

  it('point at', () => {
    const d = distance(50, 0, 100, 100);
    expect(polygon.pointAt(points1, 0.2)).toBe({
      x: 78.94427190999916,
      y: 57.888543819998326,
    });
    expect(polygon.pointAt(points1, d / (d * 2 + 100))).toBe({
      x: 100,
      y: 100,
    });
    expect(polygon.pointAt(points1, 1)).toBe({ x: 50, y: 0 });

    expect(polygon.pointAt(points2, 1)).toBe({ x: 0, y: 0 });
  });

  it('point distance', () => {
    expect(polygon.pointDistance(points1, 50, -10)).toBe(10);
    expect(polygon.pointDistance(points1, 20, 120)).toBe(20);
  });

  it('angle', () => {
    expect(polygon.tangentAngle(points1, 0)).toBe(Math.atan2(100, 50));
    expect(polygon.tangentAngle(points1, 0.2)).toBe(Math.atan2(100, 50));
    expect(polygon.tangentAngle(points1, 0.5)).toBe(Math.PI);
    expect(polygon.tangentAngle(points1, 1)).toBe(Math.atan2(100, 50) * -1);
  });
});

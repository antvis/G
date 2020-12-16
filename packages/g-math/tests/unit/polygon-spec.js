const expect = require('chai').expect;
import polygon from '../../src/polygon';
import { distance } from '../../src/util';

describe('test polygon', () => {
  // 三角形
  const points1 = [
    [50, 0],
    [100, 100],
    [0, 100],
  ];
  // 矩形
  const points2 = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ];

  it('box', () => {
    expect(polygon.box(points1)).eqls({ x: 0, y: 0, width: 100, height: 100 });
    expect(polygon.box(points2)).eqls({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('length', () => {
    expect(polygon.length(points1)).eqls(distance(50, 0, 100, 100) * 2 + 100);
    expect(polygon.length(points2)).eqls(400);
  });

  it('point at', () => {
    const d = distance(50, 0, 100, 100);
    expect(polygon.pointAt(points1, 0.2)).eqls({ x: 78.94427190999916, y: 57.888543819998326 });
    expect(polygon.pointAt(points1, d / (d * 2 + 100))).eqls({ x: 100, y: 100 });
    expect(polygon.pointAt(points1, 1)).eqls({ x: 50, y: 0 });

    expect(polygon.pointAt(points2, 1)).eqls({ x: 0, y: 0 });
  });

  it('point distance', () => {
    expect(polygon.pointDistance(points1, 50, -10)).eqls(10);
    expect(polygon.pointDistance(points1, 20, 120)).eqls(20);
  });

  it('angle', () => {
    expect(polygon.tangentAngle(points1, 0)).eqls(Math.atan2(100, 50));
    expect(polygon.tangentAngle(points1, 0.2)).eqls(Math.atan2(100, 50));
    expect(polygon.tangentAngle(points1, 0.5)).eqls(Math.PI);
    expect(polygon.tangentAngle(points1, 1)).eqls(Math.atan2(100, 50) * -1);
  });
});

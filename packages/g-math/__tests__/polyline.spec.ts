import { expect } from 'chai';
import polyline from '../src/polyline';
import { distance } from '../src/util';

describe('test polyline', () => {
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
    expect(polyline.box(points1)).eqls({ x: 0, y: 0, width: 100, height: 100 });
    expect(polyline.box(points2)).eqls({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('length', () => {
    expect(polyline.length(points1)).eqls(distance(50, 0, 100, 100) + 100);
    expect(polyline.length(points2)).eqls(300);
  });

  it('point at', () => {
    const d = distance(50, 0, 100, 100);
    expect(polyline.pointAt(points1, 0)).eqls({ x: 50, y: 0 });
    expect(polyline.pointAt(points1, 0.2)).eqls({ x: 68.94427190999916, y: 37.88854381999832 });
    expect(polyline.pointAt(points1, d / (d + 100))).eqls({ x: 100, y: 100 });
    expect(polyline.pointAt(points1, 1)).eqls({ x: 0, y: 100 });
  });

  it('point distance', () => {
    expect(polyline.pointDistance(points1, 50, -10)).eqls(10);
    expect(polyline.pointDistance(points1, 20, 120)).eqls(20);
  });

  it('angle', () => {
    expect(polyline.tangentAngle(points1, 0)).eqls(Math.atan2(100, 50));
    expect(polyline.tangentAngle(points1, 0.5)).eqls(Math.atan2(100, 50));
    expect(polyline.tangentAngle(points1, 1)).eqls(Math.PI);
  });
});

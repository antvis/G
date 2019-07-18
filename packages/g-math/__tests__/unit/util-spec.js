const expect = require('chai').expect;
import * as util from '../../src/util';

import { pointAtSegments, angleAtSegments, distanceAtSegment } from '../../src/segments';
describe('util test', () => {
  it('distance', () => {
    expect(util.distance(1, 1, 10, 1)).eqls(9);
  });

  it('point at segments 2 point', () => {
    const points = [[0, 0], [100, 100], [200, 200]];
    expect(pointAtSegments(points, -1)).eqls(null);
    expect(pointAtSegments(points, 1.2)).eqls(null);
    expect(pointAtSegments(points, 0.5)).eqls({ x: 100, y: 100 });
    expect(pointAtSegments(points, 0)).eqls({ x: 0, y: 0 });
    expect(pointAtSegments(points, 1)).eqls({ x: 200, y: 200 });
  });

  it('point at segments 5 point', () => {
    const points = [[0, 0], [100, 100], [200, 200], [300, 100], [400, 0]];
    expect(pointAtSegments(points, -1)).eqls(null);
    expect(pointAtSegments(points, 1.2)).eqls(null);
    expect(pointAtSegments(points, 0.5)).eqls({ x: 200, y: 200 });
    expect(pointAtSegments(points, 0)).eqls({ x: 0, y: 0 });
    expect(pointAtSegments(points, 1)).eqls({ x: 400, y: 0 });
    expect(pointAtSegments(points, 0.25)).eqls({ x: 100, y: 100 });
  });

  it('point at segements, overlapping', () => {
    // 测试重合点
    expect(pointAtSegments([[1, 1], [1, 1]], 0.5)).eqls({ x: 1, y: 1 });
  });
  it('angle at segment', () => {
    const points = [[0, 0], [100, 100], [200, 200], [300, 100], [400, 0]];
    expect(angleAtSegments(points, -1)).eqls(0);
    expect(angleAtSegments(points, 1.2)).eqls(0);
    expect(angleAtSegments(points, 0.5)).eqls(Math.PI / 4);
    expect(angleAtSegments(points, 1)).eqls((Math.PI / 4) * -1);
  });

  it('angle at segement, special', () => {
    expect(angleAtSegments([[0, 0]], 0.5)).eqls(0);
    expect(angleAtSegments([[1, 1], [1, 1]], 0.5)).eqls(0);
  });

  it('distance at segment', () => {
    // 矩形
    const points = [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]];
    expect(distanceAtSegment(points, 10, 10)).eqls(10);
    expect(distanceAtSegment(points, 10, 0)).eqls(0);
    expect(distanceAtSegment(points, 110, 110)).eqls(util.distance(0, 0, 10, 10));
  });
});

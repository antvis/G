const expect = require('chai').expect;
import * as util from '../../src/util';

describe('util test', () => {
  it('distance', () => {
    expect(util.distance(1, 1, 10, 1)).eqls(9);
  });

  it('line at', () => {
    expect(util.pointAtLine(0, 0, 10, 10, 0.1)).eqls({ x: 1, y: 1 });
    expect(util.pointAtLine(0, 0, 10, 10, 0.5)).eqls({ x: 5, y: 5 });
    expect(util.pointAtLine(0, 0, 10, 10, 1)).eqls({ x: 10, y: 10 });
  });

  it('point at segments 2 point', () => {
    const segs = [[0, 0], [100, 100], [200, 200]];
    expect(util.pointAtSegments(segs, -1)).eqls(null);
    expect(util.pointAtSegments(segs, 1.2)).eqls(null);
    expect(util.pointAtSegments(segs, 0.5)).eqls({ x: 100, y: 100 });
    expect(util.pointAtSegments(segs, 0)).eqls({ x: 0, y: 0 });
    expect(util.pointAtSegments(segs, 1)).eqls({ x: 200, y: 200 });
  });

  it('point at segments 5 point', () => {
    const segs = [[0, 0], [100, 100], [200, 200], [300, 100], [400, 0]];
    expect(util.pointAtSegments(segs, -1)).eqls(null);
    expect(util.pointAtSegments(segs, 1.2)).eqls(null);
    expect(util.pointAtSegments(segs, 0.5)).eqls({ x: 200, y: 200 });
    expect(util.pointAtSegments(segs, 0)).eqls({ x: 0, y: 0 });
    expect(util.pointAtSegments(segs, 1)).eqls({ x: 400, y: 0 });
    expect(util.pointAtSegments(segs, 0.25)).eqls({ x: 100, y: 100 });
  });

  it('point at segements, overlapping', () => {
    // 测试重合点
    expect(util.pointAtSegments([[1, 1], [1, 1]], 0.5)).eqls({ x: 1, y: 1 });
  });
  it('angle at segment', () => {
    const segs = [[0, 0], [100, 100], [200, 200], [300, 100], [400, 0]];
    expect(util.angleAtSegments(segs, -1)).eqls(0);
    expect(util.angleAtSegments(segs, 1.2)).eqls(0);
    expect(util.angleAtSegments(segs, 0.5)).eqls(Math.PI / 4);
    expect(util.angleAtSegments(segs, 1)).eqls((Math.PI / 4) * -1);
  });

  it('angle at segement, special', () => {
    expect(util.angleAtSegments([[0, 0]], 0.5)).eqls(0);
    expect(util.angleAtSegments([[1, 1], [1, 1]], 0.5)).eqls(0);
  });
});

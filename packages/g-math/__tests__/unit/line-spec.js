const expect = require('chai').expect;
import line from '../../src/line';
import { distance } from '../../src/util';

describe('line test', () => {
  it('box', () => {
    expect(line.box(0, 0, 100, 100)).eqls({ x: 0, y: 0, width: 100, height: 100 });
    expect(line.box(100, 100, 0, 0)).eqls({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('length', () => {
    expect(distance(0, 0, 100, 100)).eqls(line.length(0, 0, 100, 100));
  });

  it('line at', () => {
    expect(line.pointAt(0, 0, 10, 10, 0.1)).eqls({ x: 1, y: 1 });
    expect(line.pointAt(0, 0, 10, 10, 0.5)).eqls({ x: 5, y: 5 });
    expect(line.pointAt(0, 0, 10, 10, 1)).eqls({ x: 10, y: 10 });
  });
  it('distance to line', () => {
    expect(line.pointToLine(0, 0, 100, 0, 0, 10)).eqls(10); // 垂直方向
    expect(line.pointToLine(0, 0, 100, 0, 10, 0)).eqls(0); // 在线上
    expect(line.pointToLine(0, 0, 100, 0, 101, 0)).eqls(0); // 在延长线上

    expect(line.pointToLine(0, 0, 100, 0, 101, 10)).eqls(10); // 在外面上
    expect(line.pointToLine(0, 0, 100, 0, -10, 10)).eqls(10); // 在外面上
  });

  it('distance to line segment', () => {
    expect(line.pointDistance(0, 0, 100, 0, 0, 10)).eqls(10); // 垂直方向
    expect(line.pointDistance(0, 0, 100, 0, 10, 0)).eqls(0); // 在线上

    expect(line.pointDistance(0, 0, 100, 0, 101, 0)).eqls(1); // 在延长线上
    expect(line.pointDistance(0, 0, 100, 0, 101, 10)).eqls(distance(100, 0, 101, 10)); // 在外面上
    expect(line.pointDistance(0, 0, 100, 0, -10, 10)).eqls(distance(0, 0, -10, 10)); // 在外面上
  });

  it('angle', () => {
    expect(line.tangentAngle(0, 0, 10, 10)).eqls((Math.PI * 1) / 4);
    expect(line.tangentAngle(10, 10, 10, 10)).eqls(0);
    expect(line.tangentAngle(0, 10, 10, 10)).eqls(0);
    expect(line.tangentAngle(0, 0, -4, -4)).eqls((-3 / 4) * Math.PI);
  });
});

const expect = require('chai').expect;
import rect from '../../src/rect';
import { distance } from '../../src/util';

describe('rect test', () => {
  it('box', () => {
    expect(rect.box(0, 0, 100, 100)).eqls({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });

  it('length', () => {
    expect(rect.length(0, 0, 100, 100)).eqls(400);
  });

  it('pointDistance', () => {
    expect(rect.pointDistance(0, 0, 100, 100, 110, 110)).eqls(distance(100, 100, 110, 110));
    expect(rect.pointDistance(0, 0, 100, 100, 10, 0)).eqls(0);
    expect(rect.pointDistance(0, 0, 100, 100, 10, 10)).eqls(10);
  });

  it('point at', () => {
    expect(rect.pointAt(0, 0, 100, 100, 0)).eqls({ x: 0, y: 0 });
    expect(rect.pointAt(0, 0, 100, 100, 0.1)).eqls({ x: 40, y: 0 });
    expect(rect.pointAt(0, 0, 100, 100, 0.5)).eqls({ x: 100, y: 100 });
    expect(rect.pointAt(0, 0, 100, 100, 1)).eqls({ x: 0, y: 0 });
  });

  it('tangentAngle', () => {
    expect(rect.tangentAngle(0, 0, 100, 100, 0)).eqls(0);
    expect(rect.tangentAngle(0, 0, 100, 100, 0.1)).eqls(0);
    expect(rect.tangentAngle(0, 0, 100, 100, 0.5)).eqls(Math.PI / 2);
    expect(rect.tangentAngle(0, 0, 100, 100, 1)).eqls((Math.PI * -1) / 2);
  });
});

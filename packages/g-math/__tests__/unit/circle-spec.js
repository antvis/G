const expect = require('chai').expect;
import circle from '../../src/circle';
import { distance } from '../../src/util';

function equalPoint(obj1, obj2) {
  return distance(obj1.x, obj1.y, obj2.x, obj2.y) < 0.01;
}

function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.01;
}
describe('circle test', () => {
  it('box', () => {
    expect(circle.box(0, 0, 10)).eqls({
      x: -10,
      y: -10,
      width: 20,
      height: 20,
    });
  });
  it('length', () => {
    expect(circle.length(0, 0, 10)).eqls(Math.PI * 20);
  });

  it('pointAt', () => {
    expect(equalPoint(circle.pointAt(0, 0, 10, 0), { x: 10, y: 0 })).eqls(true);
    expect(equalPoint(circle.pointAt(0, 0, 10, 0.25), { x: 0, y: 10 })).eqls(true);
    expect(equalPoint(circle.pointAt(0, 0, 10, 0.5), { x: -10, y: 0 })).eqls(true);
    expect(equalPoint(circle.pointAt(0, 0, 10, 1), { x: 10, y: 0 })).eqls(true);
    expect(equalPoint(circle.pointAt(0, 0, 10, 1.2), circle.pointAt(0, 0, 10, 0.2))).eqls(true);
  });

  it('pointDistance', () => {
    expect(circle.pointDistance(0, 0, 10, 0, 0)).eqls(10);
    expect(circle.pointDistance(0, 0, 10, 0, 10)).eqls(0);
    expect(circle.pointDistance(0, 0, 10, 20, 0)).eqls(10);
  });

  it('angle', () => {
    expect(circle.tangentAngle(0, 0, 10, 0)).eqls(Math.PI / 2);
    expect(equal(circle.tangentAngle(0, 0, 10, 1 / 6), Math.PI * (2 / 6 + 1 / 2))).eqls(true);
  });
});

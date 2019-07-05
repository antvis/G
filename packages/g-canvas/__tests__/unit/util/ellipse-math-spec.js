const expect = require('chai').expect;
import EllipseMath from '../../../src/util/math/ellipse';
function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.001;
}
describe('test ellipse math', () => {

  it('test arc params', () => {
    const params = EllipseMath.getArcParams([ 100, 100 ], [ 'A', 10, 10, 0, 1, 1, 120, 120 ]);
    expect(equal(params.cx, 110)).equal(true);
    expect(equal(params.cy, 110)).equal(true);
    expect(equal(params.rx, 10 * Math.sqrt(2))).equal(true);
    expect(equal(params.ry, 10 * Math.sqrt(2))).equal(true);
    expect(equal(params.endAngle - params.startAngle, Math.PI)).equal(true);

    const params1 = EllipseMath.getArcParams([ 100, 100 ], [ 'A', 20, 10, 90, 1, 1, 120, 100 ]);
    expect(equal(params1.cx, 110)).equal(true);
    expect(equal(params1.cy, 100)).equal(true);
    expect(equal(params1.rx, 20)).equal(true);
    expect(equal(params1.ry, 10)).equal(true);

  });

  it('test xAt', () => {
    expect(EllipseMath.xAt(0, 10, 10, 100, 0)).equal(110)
    expect(EllipseMath.xAt(0, 10, 10, 100, Math.PI)).equal(90)
    expect(EllipseMath.xAt(0, 10, 10, 100, Math.PI / 2)).equal(100)

    expect(EllipseMath.xAt(0, 10, 20, 100, 0)).equal(110);
    expect(EllipseMath.xAt(0, 10, 20, 100, Math.PI / 2)).equal(100)

  });

  it('test yAt', () => {
    expect(EllipseMath.yAt(0, 10, 10, 100, 0)).equal(100)
    expect(EllipseMath.yAt(0, 10, 10, 100, Math.PI)).equal(100)
    expect(EllipseMath.yAt(0, 10, 10, 100, Math.PI / 2)).equal(110)

    expect(EllipseMath.yAt(0, 10, 20, 100, 0)).equal(100);
    expect(EllipseMath.yAt(0, 10, 20, 100, Math.PI / 2)).equal(120)
  });

  it('test xExtrema', () => {
    
  });

  it('test yExtrema', () => {

  });

});



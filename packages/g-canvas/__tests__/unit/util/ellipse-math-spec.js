const expect = require('chai').expect;
import getArcParams from '../../../src/util/arc-params';
function equal(v1, v2) {
  return Math.abs(v1 - v2) < 0.001;
}
describe('test ellipse math', () => {
  it('test arc params', () => {
    const params = getArcParams([100, 100], ['A', 10, 10, 0, 1, 1, 120, 120]);
    expect(equal(params.cx, 110)).equal(true);
    expect(equal(params.cy, 110)).equal(true);
    expect(equal(params.rx, 10 * Math.sqrt(2))).equal(true);
    expect(equal(params.ry, 10 * Math.sqrt(2))).equal(true);
    expect(equal(params.endAngle - params.startAngle, Math.PI)).equal(true);

    const params1 = getArcParams([100, 100], ['A', 20, 10, 90, 1, 1, 120, 100]);
    expect(equal(params1.cx, 110)).equal(true);
    expect(equal(params1.cy, 100)).equal(true);
    expect(equal(params1.rx, 20)).equal(true);
    expect(equal(params1.ry, 10)).equal(true);
  });
});

const chai = require('chai');
import Element3D from '../../src/abstract/element3d';

const chaiDeepCloseTo = require('chai-deep-closeto');
chai.use(chaiDeepCloseTo);

const { expect } = chai;

class MyElement extends Element3D {
  getBBox() {
    const { x, y, width, height } = this.attrs;
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
  clearTotalMatrix() {}
}

describe('element3d', () => {
  it('translate', () => {
    const element = new MyElement({
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    // single param
    element.translate(20);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 20, 0, 0, 1]);
    // two params
    element.translate(20, 40);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 40, 40, 0, 1]);
    // three params
    element.translate(20, 20, 60);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 60, 60, 60, 1]);
  });

  it('move', () => {
    const element = new MyElement({
      attrs: {
        x: 20,
        y: 20,
        z: 20,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    element.move(80, 80, 80);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 60, 60, 60, 1]);
  });

  it('scale', () => {
    const element = new MyElement({
      attrs: {
        x: 0,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    // single param
    element.scale(0.8);
    expect(element.attr('matrix')).eqls([0.8, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 1]);
    // two params
    element.scale(2, 4);
    expect(element.attr('matrix')).eqls([1.6, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 1]);
    // three params
    element.scale(2, 2, 2);
    expect(element.attr('matrix')).eqls([3.2, 0, 0, 0, 0, 6.4, 0, 0, 0, 0, 1.6, 0, 0, 0, 0, 1]);
  });

  it('rotate', () => {
    const element = new MyElement({
      attrs: {
        x: 0,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    const radian = Math.PI / 4;
    element.rotate(radian, [1, 1, 1]);
    const length = Math.sqrt(3);
    const lengthPow = Math.pow(1, 2) + Math.pow(1, 2) + Math.pow(1, 2);
    // 1e-10 级别的近似相等
    expect(element.attr('matrix')).to.be.deep.closeTo(
      [
        (1 + 2 * Math.cos(radian)) / lengthPow,
        (1 - Math.cos(radian) + length * Math.sin(radian)) / lengthPow,
        (1 - Math.cos(radian) - length * Math.sin(radian)) / lengthPow,
        0,
        (1 - Math.cos(radian) - length * Math.sin(radian)) / lengthPow,
        (1 + 2 * Math.cos(radian)) / lengthPow,
        (1 - Math.cos(radian) + length * Math.sin(radian)) / lengthPow,
        0,
        (1 - Math.cos(radian) + length * Math.sin(radian)) / lengthPow,
        (1 - Math.cos(radian) - length * Math.sin(radian)) / lengthPow,
        (1 + 2 * Math.cos(radian)) / lengthPow,
        0,
        0,
        0,
        0,
        1,
      ],
      1e-10
    );
  });
});

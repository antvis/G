const expect = require('chai').expect;
import Element2D from '../../src/abstract/element2d';

class MyElement extends Element2D {
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

describe('element2d', () => {
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
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 1, 0, 20, 0, 1]);
    // two params
    element.translate(20, 40);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 1, 0, 40, 40, 1]);
  });

  it('move', () => {
    const element = new MyElement({
      attrs: {
        x: 20,
        y: 20,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    // two params
    element.move(60, 60);
    expect(element.attr('matrix')).eqls([1, 0, 0, 0, 1, 0, 40, 40, 1]);
  });

  it('scale', () => {
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
    element.scale(0.8);
    expect(element.attr('matrix')).eqls([0.8, 0, 0, 0, 0.8, 0, 0, 0, 1]);
    // two params
    element.scale(2, 4);
    expect(element.attr('matrix')).eqls([1.6, 0, 0, 0, 3.2, 0, 0, 0, 1]);
  });

  it('rotate', () => {
    const element = new MyElement({
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    expect(element.attr('matrix')).eqls(null);
    const radian = Math.PI / 4;
    // single param
    element.rotate(radian);
    expect(element.attr('matrix')).eqls([
      Math.cos(radian),
      Math.sin(radian),
      0,
      -Math.sin(radian),
      Math.cos(radian),
      0,
      0,
      0,
      1,
    ]);
  });
});

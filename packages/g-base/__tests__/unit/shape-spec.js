const expect = require('chai').expect;
import Shape from '../../src/abstract/shape';

class MyShape extends Shape {
  calculateBBox() {
    const { x, y, width, height } = this.attrs;
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }

  applyToMatrix(v) {
    return [v[0] * 2, v[1] * 2, 1];
  }

  calculateCanvasBBox() {
    const bbox = this.getBBox();
    const topLeft = this.applyToMatrix([bbox.minX, bbox.minY, 1]);
    const topRight = this.applyToMatrix([bbox.maxX, bbox.minY, 1]);
    const bottomLeft = this.applyToMatrix([bbox.minX, bbox.maxY, 1]);
    const bottomRight = this.applyToMatrix([bbox.maxX, bbox.maxY, 1]);
    return {
      minX: Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      maxX: Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      minY: Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      maxY: Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
    };
  }
}

describe('test element', () => {
  const shape = new MyShape({
    attrs: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
  });
  it('test clone', () => {
    const shape = new MyShape({
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    const newShape = shape.clone();
    expect(newShape.attrs).eqls(shape.attrs);
  });
  it('getBBox', () => {
    const bbox = shape.getBBox();
    expect(bbox.minX).equal(0);
    expect(bbox.minY).equal(0);
    expect(bbox.maxX).equal(100);
    expect(bbox.maxY).equal(100);
  });

  it('getCanvasBBox', () => {
    const bbox = shape.getCanvasBBox();
    expect(bbox.minX).equal(0);
    expect(bbox.minY).equal(0);
    expect(bbox.maxX).equal(100 * 2);
    expect(bbox.maxY).equal(100 * 2);
    expect(shape.getCanvasBBox()).eql(bbox); // 测试缓存
    expect(shape.get('canvasBox')).not.eqls(undefined);
    expect(shape.get('canvasBox')).not.eqls(null);
  });

  it('attr change', () => {
    shape.attr('x', 10);
    shape.attr('y', 10);
    expect(shape.get('bbox')).eqls(null);
    expect(shape.get('canvasBox')).eqls(null);
    expect(shape.getBBox()).eqls({
      minX: 10,
      minY: 10,
      maxX: 110,
      maxY: 110,
    });
  });
});

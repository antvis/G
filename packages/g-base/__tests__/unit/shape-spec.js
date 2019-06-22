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
}

describe('test element', () => {
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
});

import { expect } from 'chai';
import { getBBoxMehod } from '../../src/box/index';
import Shape from '../../src/abstract/shape';
import { getTextWidth } from '../../src/util/text';

describe('test bbox', () => {
  class MyShape extends Shape {
    calculateBBox() {
      const type = this.get('type');
      const bboxMethod = getBBoxMehod(type);
      return bboxMethod(this);
    }
  }

  it('rect', () => {
    const rect = new MyShape({
      type: 'rect',
      attrs: { x: 0, y: 0, width: 10, height: 20 },
    });
    const bbox = rect.getBBox();
    expect(bbox).eqls({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
    });
  });
  it('circle', () => {
    const shape = new MyShape({
      type: 'circle',
      attrs: { x: 0, y: 0, r: 10 },
    });
    const bbox = shape.getBBox();
    expect(bbox).eqls({
      x: -10,
      y: -10,
      width: 20,
      height: 20,
    });
  });
  it('ellipse', () => {
    const shape = new MyShape({
      type: 'ellipse',
      attrs: { x: 0, y: 0, rx: 10, ry: 20 },
    });
    const bbox = shape.getBBox();
    expect(bbox).eqls({
      x: -10,
      y: -20,
      width: 20,
      height: 40,
    });
  });

  it('polygon', () => {
    const shape = new MyShape({
      type: 'polygon',
      attrs: {
        points: [
          [10, 10],
          [100, 100],
          [50, 120],
        ],
      },
    });
    const bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 10,
      y: 10,
      width: 90,
      height: 110,
    });
  });

  it('polyline', () => {
    const shape = new MyShape({
      type: 'polyline',
      attrs: {
        points: [
          [10, 10],
          [100, 100],
          [50, 120],
        ],
      },
    });
    const bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 10,
      y: 10,
      width: 90,
      height: 110,
    });
  });

  it('text', () => {
    const shape = new MyShape({
      type: 'text',
      attrs: { x: 10, y: 10, text: '123', fontSize: 12, fontFamily: 'sans-serif' },
    });

    let bbox = shape.getBBox();
    const width = getTextWidth(shape.attr('text'), '12px sans-serif');
    expect(bbox).eqls({
      x: 10,
      y: -2,
      width,
      height: 12,
    });
    shape.attr('textAlign', 'center');
    bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 10 - width / 2,
      y: -2,
      width,
      height: 12,
    });
  });

  it('path', () => {
    const shape = new MyShape({
      type: 'path',
      attrs: {
        path: 'M 10 10 L 100, 100',
      },
    });
    let bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 10,
      y: 10,
      width: 90,
      height: 90,
    });
    shape.attr('path', [
      ['M', 100, 100],
      ['A', 10, 10, 0, 0, 0, 120, 100],
    ]);

    bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 100,
      y: 100,
      width: 20,
      height: 10,
    });
  });

  it('path with angle', () => {
    const shape = new MyShape({
      type: 'path',
      attrs: {
        path: 'M 10 10 L 100, 100 L 50, 120',
        lineWidth: 10,
      },
    });
    const bbox = shape.getBBox();
    expect(bbox.width > 90).eql(true);
  });
});

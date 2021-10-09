import { expect } from 'chai';
import { getBBoxMethod } from '../../src/bbox/index';
import Shape from '../../src/abstract/shape';
import { getTextWidth } from '../../src/util/text';

describe('test bbox', () => {
  class MyShape extends Shape {
    calculateBBox() {
      const type = this.get('type');
      const bboxMethod = getBBoxMethod(type);
      return bboxMethod(this);
    }
  }

  class Rect extends Shape {
    calculateBBox() {
      const bboxMethod = getBBoxMethod('rect');
      const bbox = bboxMethod(this);
      return {
        ...bbox,
        minX: bbox.x,
        minY: bbox.y,
        maxX: bbox.x + bbox.width,
        maxY: bbox.y + bbox.height,
      };
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

  it('image', () => {
    const rect = new MyShape({
      type: 'image',
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

  it('marker', () => {
    const shape = new MyShape({
      type: 'marker',
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

  it('line', () => {
    const shape = new MyShape({
      type: 'line',
      attrs: {
        x1: 10,
        y1: 20,
        x2: 50,
        y2: 60,
      },
    });
    const bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 10,
      y: 20,
      width: 40,
      height: 40,
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
  it('text is number', () => {
    const shape = new MyShape({
      type: 'text',
      attrs: { x: 10, y: 10, text: 123, fontSize: 12, fontFamily: 'sans-serif' },
    });
    const bbox = shape.getBBox();
    const width = getTextWidth(shape.attr('text'), '12px sans-serif');
    expect(bbox).eqls({
      x: 10,
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

    shape.attr('path', [
      ['M', 100, 100],
      ['L', NaN, NaN],
      ['A', 10, 10, 0, 0, 0, 120, 100],
    ]);

    bbox = shape.getBBox();
    expect(bbox).eqls({
      x: 100,
      y: 100,
      width: 0,
      height: 0,
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
    expect(bbox.width).eql(90);
    shape.attr('stroke', 'red');
    expect(shape.getBBox().width > 90).eqls(true);
  });

  it('path complex', () => {
    const shape = new MyShape({
      type: 'path',
      attrs: {
        fill: '#1890ff',
        path: [
          ['M', 227.31794680557064, 200.00000266808433],
          ['L', 87.61525298763183, 98.50004569833794],
          ['A', 172.6820363488079, 172.6820363488079, 0, 0, 0, 63.08757910043951, 253.36168385505405],
          ['L', 227.31794680557064, 200.00000266808433],
          ['Z'],
        ],
      },
    });

    const bbox1 = shape.getBBox();
    expect(bbox1.x).eqls(54.63591866828193);
    expect(bbox1.y).eqls(98.50004569833794);
  });

  it('shadow', () => {
    const rect = new Rect({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 10,
        height: 20,
      },
    });
    const bbox = rect.getBBox();
    expect(rect.getCanvasBBox().width).eqls(bbox.width);
    rect.attr({ shadowBlur: 10 }); // 没有 color 不生效
    let canvasBBox = rect.getCanvasBBox();
    expect(rect.getCanvasBBox().width).eqls(bbox.width);

    rect.attr({ shadowColor: 'red', shadowBlur: 10 });
    canvasBBox = rect.getCanvasBBox();
    expect(canvasBBox.x).eql(bbox.x - 10);
    expect(canvasBBox.width).eql(bbox.width + 10 * 2);
    expect(canvasBBox.height).eql(bbox.height + 10 * 2);

    rect.attr({ shadowColor: 'red', shadowBlur: 10, shadowOffsetX: 10, shadowOffsetY: -10 });
    canvasBBox = rect.getCanvasBBox();
    expect(canvasBBox.width).eql(bbox.width + 10 * 2);
    expect(canvasBBox.height).eql(bbox.height + 10 * 2);
    expect(canvasBBox.x).eql(bbox.x);
    expect(canvasBBox.y).eql(bbox.y - 20);

    rect.set('totalMatrix', [1, 0, 0, 1, 0, 0, 10, 20, 1]); // 位移 10, 20
    rect.set('canvasBBox', null);
    canvasBBox = rect.getCanvasBBox();

    expect(canvasBBox.x).eql(bbox.x + 10);
    expect(canvasBBox.y).eql(bbox.y);
  });
});

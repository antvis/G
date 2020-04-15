const expect = require('chai').expect;
import Canvas from '../../../src/canvas';
import { getShape } from '../../../src/util/hit';
const dom = document.createElement('div');
document.body.appendChild(dom);

describe('quick hit test', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    height: 500,
  });

  it('shapes', () => {
    const shape = canvas.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        fill: 'red',
      },
    });
    expect(getShape(canvas, 10, 10)).eqls(shape);
    expect(getShape(canvas, 20, 25)).eqls(shape);
    expect(getShape(canvas, 9, 9)).eqls(null);
    const shape1 = canvas.addShape({
      type: 'rect',
      attrs: {
        x: 20,
        y: 20,
        width: 100,
        height: 50,
        fill: 'blue',
      },
    });
    expect(getShape(canvas, 20, 25)).eqls(shape1);
  });

  it('shape with matrix', () => {
    canvas.clear();
    expect(getShape(canvas, 10, 10)).eqls(null);
    const shape = canvas.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        fill: 'red',
      },
    });
    shape.translate(100, 100);
    expect(getShape(canvas, 10, 10)).eqls(null);
    expect(getShape(canvas, 110, 110)).eqls(shape);
    shape.resetMatrix();
    expect(getShape(canvas, 10, 10)).eqls(shape);
    canvas.clear();
    expect(getShape(canvas, 10, 10)).eqls(null);
  });

  it('shape with clip', () => {
    const shape = canvas.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        fill: 'red',
      },
    });
    shape.setClip({
      type: 'rect',
      attrs: {
        x: 20,
        y: 20,
        width: 100,
        height: 100,
      },
    });
    expect(getShape(canvas, 10, 10)).eqls(null);
    expect(getShape(canvas, 21, 21)).eqls(shape);
    shape.setClip({
      type: 'rect',
      attrs: {
        x: 20,
        y: 20,
        width: 10,
        height: 10,
      },
    });
    expect(getShape(canvas, 31, 31)).eqls(null);
    canvas.clear();
  });

  it('group', () => {
    const group = canvas.addGroup();
    const shape = group.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        fill: 'red',
      },
    });
    expect(getShape(canvas, 10, 10)).eqls(shape);

    group.translate(10, 10);
    expect(getShape(canvas, 10, 10)).eqls(null);
    expect(getShape(canvas, 20, 20)).eqls(shape);
    shape.translate(10, 10);
    expect(getShape(canvas, 20, 20)).eqls(null);

    const group1 = canvas.addGroup();
    const shape1 = group1.addShape({
      type: 'rect',
      attrs: {
        x: 50,
        y: 50,
        width: 100,
        height: 50,
        fill: 'blue',
      },
    });
    expect(getShape(canvas, 51, 51)).eqls(shape1);
    canvas.clear();
  });

  it('group with clip', () => {
    const group = canvas.addGroup();
    const shape = group.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        fill: 'red',
      },
    });
    group.setClip({
      type: 'circle',
      attrs: {
        x: 50,
        y: 50,
        r: 10,
      },
    });
    expect(getShape(canvas, 10, 10)).eqls(null);
    expect(getShape(canvas, 50, 50)).eqls(shape);
    group.translate(100, 100);
    expect(getShape(canvas, 150, 150)).eqls(shape);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);

describe('#233', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    height: 500,
  });
  const element = canvas.get('el');

  it('cursor attr for shape should be effective', () => {
    canvas.addShape({
      type: 'circle',
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
        cursor: 'pointer',
      },
    });

    canvas.addShape({
      type: 'circle',
      attrs: {
        x: 180,
        y: 100,
        r: 50,
        fill: 'blue',
        cursor: 'crosshair',
      },
    });

    // 画布 => shape
    let point = getClientPoint(canvas, 100, 100);
    simulateMouseEvent(element, 'mouseenter', {
      clientX: point.clientX,
      clientY: point.clientY,
    });
    expect(element.style.cursor).eqls('pointer');

    // shape => shape
    point = getClientPoint(canvas, 132, 100);
    simulateMouseEvent(element, 'mousemove', {
      clientX: point.clientX,
      clientY: point.clientY,
    });
    expect(element.style.cursor).eqls('crosshair');

    // shape => 画布
    point = getClientPoint(canvas, 250, 100);
    simulateMouseEvent(element, 'mousemove', {
      clientX: point.clientX,
      clientY: point.clientY,
    });
    expect(element.style.cursor).eqls('default');
  });
});

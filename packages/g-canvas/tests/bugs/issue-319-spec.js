const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid black';
dom.style.width = '600px';
dom.style.height = '600px';

describe('#319', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    // cursor: 'default',
  });
  const el = canvas.get('el');

  it('getCursor and setCursor for canvas should work', () => {
    canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
        cursor: 'pointer',
      },
    });
    canvas.addShape('circle', {
      attrs: {
        x: 180,
        y: 100,
        r: 50,
        fill: 'blue',
        cursor: 'move',
      },
    });
    expect(canvas.getCursor()).eqls('default');
    expect(canvas.setCursor('crosshair'));
    expect(canvas.getCursor()).eqls('crosshair');
    // circle1
    const { clientX, clientY } = getClientPoint(canvas, 100, 100);
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY,
    });
    expect(el.style.cursor).eqls('pointer');
    // circle2
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 80,
      clientY,
    });
    expect(el.style.cursor).eqls('move');
    // canvas
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 200,
      clientY,
    });
    expect(el.style.cursor).eqls('crosshair');
  });
});

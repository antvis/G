const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid black';
dom.style.width = '400px';
dom.style.height = '400px';

describe('#321', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });
  const el = canvas.get('el');

  it('mouseleave event should be emitted from shape to outside of canvas directly', () => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        r: 100,
        fill: 'red',
      },
    });

    circle.on('mouseenter', () => {
      circle.attr('fill', 'red');
    });
    circle.on('mouseleave', () => {
      circle.attr('fill', 'blue');
    });

    const { clientX, clientY } = getClientPoint(canvas, -10, -10);
    simulateMouseEvent(el, 'mouseleave', {
      clientX,
      clientY,
    });

    setTimeout(() => {
      expect(circle.attr('fill')).eqls('blue');
    }, 0);
  });
});

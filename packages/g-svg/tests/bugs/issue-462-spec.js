const expect = require('chai').expect;
import Canvas from '../../../g-svg/src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#462', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');

  it('toFront() method should work', (done) => {
    // rect1
    const rect1 = canvas.addShape('rect', {
      name: 'rect1',
      attrs: {
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        fill: 'red',
      },
    });

    // rect2
    canvas.addShape('rect', {
      name: 'rect2',
      attrs: {
        x: 125,
        y: 125,
        width: 50,
        height: 50,
        fill: 'blue',
      },
    });

    rect1.toFront();

    let clickedShape = null;
    canvas.on('click', (e) => {
      clickedShape = e.target;
    });

    // must trigger event after rendering
    setTimeout(() => {
      const { clientX, clientY } = getClientPoint(canvas, 101, 101);
      // simulate click event in the intersection area of rect1 and rect2
      simulateMouseEvent(el, 'mousedown', {
        clientX,
        clientY,
      });
      simulateMouseEvent(el, 'mouseup', {
        clientX,
        clientY,
      });

      expect(clickedShape.get('name')).eqls('rect1');
    });
    done();
  }, 25);
});

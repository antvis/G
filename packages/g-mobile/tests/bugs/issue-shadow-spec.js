const expect = require('chai').expect;
import Canvas from '../../src/canvas';
const dom = document.createElement('div');
document.body.appendChild(dom);
import { getColor } from '../get-color';

describe('shadow', () => {
  const canvas = new Canvas({
    container: dom,
    pixelRatio: 1,
    width: 300,
    height: 300,
  });
  const context = canvas.get('context');

  const circle = canvas.addShape('circle', {
    draggable: true,
    attrs: {
      x: 100,
      y: 100,
      r: 20,
      fill: 'red',
      shadowBlur: 10,
      shadowColor: 'blue',
      shadowOffsetX: 10,
    },
  });

  circle.on('drag', (ev) => {
    circle.attr({
      x: ev.x,
      y: ev.y,
    });
  });

  it('shadow', (done) => {
    setTimeout(() => {
      const color = getColor(context, 124, 101);
      expect(color).eql('#0000ff');
      done();
    }, 200);
  });

  it('blur offset', (done) => {
    circle.animate(
      {
        x: 10,
        y: 10,
      },
      200
    );
    setTimeout(() => {
      const color = getColor(context, 50, 50);
      expect(color).eql('#000000');
      done();
    }, 200);
  });
});

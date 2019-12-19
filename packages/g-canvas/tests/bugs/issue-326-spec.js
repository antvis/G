const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';
import { getClientPoint, simulateMouseEvent } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPath(start, end) {
  const path = [];
  path.push(['M', start.x, start.y]);
  const r = distance(start, end);
  path.push(['M', start.x, start.y]);
  path.push(['A', r, r, 0, 0, 0, end.x, end.y]);
  path.push(['A', r, r, 0, 0, 0, start.x, start.y]);
  path.push(['Z']);
  return path;
}

describe('#326', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });

  const context = canvas.get('context');
  const el = canvas.get('el');

  it('partial rendering for arc path should be correct when rx or ry is 0', () => {
    const shape = canvas.addShape({
      type: 'path',
      attrs: {
        fill: 'red',
        path: [],
      },
    });
    let start;
    canvas.on('mousedown', (ev) => {
      start = {
        x: ev.x,
        y: ev.y,
      };
    });

    canvas.on('mousemove', (ev) => {
      if (start) {
        const current = {
          x: ev.x,
          y: ev.y,
        };
        shape.attr('path', getPath(start, current));
      }
    });

    canvas.on('mouseup', () => {
      start = null;
    });

    const { clientX, clientY } = getClientPoint(canvas, 10, 10);
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 100,
      clientY: clientY + 100,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX: clientX + 100,
      clientY: clientY + 100,
    });
    setTimeout(() => {
      expect(getColor(context, 50, 50)).eqls('#ff0000');
      expect(getColor(context, 50, 150)).eqls('#000000');
    }, 0);
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY: clientY + 110,
    });
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 100,
      clientY: clientY + 110 + 100,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX: clientX + 100,
      clientY: clientY + 110 + 100,
    });
    setTimeout(() => {
      expect(getColor(context, 50, 50)).eqls('#000000');
      expect(getColor(context, 50, 150)).eqls('#ff0000');
    }, 0);
  });
});

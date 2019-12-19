// const expect = require('chai').expect;
import Canvas from '../../src/canvas';
// import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#323', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });

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

  it('test', () => {});
});

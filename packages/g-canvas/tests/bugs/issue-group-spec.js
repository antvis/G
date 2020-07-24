const expect = require('chai').expect;
import Canvas from '../../src/canvas';
const dom = document.createElement('div');
document.body.appendChild(dom);
dom.style.backgroundColor = 'gray';
import { getColor } from '../get-color';

describe('shadow', () => {
  const canvas = new Canvas({
    container: dom,
    pixelRatio: 1,
    width: 300,
    height: 300,
  });
  const context = canvas.get('context');

  const group2 = canvas.addGroup().addGroup();
  const line = group2.addShape({
    type: 'line',
    attrs: {
      x1: 100,
      y1: 100,
      x2: 200,
      y2: 200,
      stroke: 'red',
    },
  });

  const group1 = canvas.addGroup().addGroup();
  group1.attr('matrix', [1, 0, 0, 0, 1, 0, 100, 100, 1]);
  const circle = group1.addShape('circle', {
    draggable: true,
    attrs: {
      x: 0,
      y: 0,
      r: 20,
      fill: 'red',
    },
  });

  circle.on('drag', (ev) => {
    group1.attr('matrix', [1, 0, 0, 0, 1, 0, ev.x, ev.y, 1]);
    line.attr({
      x1: ev.x,
      y1: ev.y,
    });
  });
  circle.on('mouseenter', () => {
    circle.attr({
      fill: 'blue',
    });
  });

  circle.on('mouseleave', () => {
    circle.attr({
      fill: 'red',
    });
  });

  it('effect other shape', (done) => {
    circle.attr('fill', 'blue');
    setTimeout(() => {
      expect(getColor(context, 115, 115)).eql('#ff0000');
      done();
    }, 60);
  });
});

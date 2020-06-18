const expect = require('chai').expect;
import * as Util from '@antv/util';
const Simulate = require('event-simulate');
import Canvas from '../../src/canvas';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const context = canvas.getContext('2d');

const offscreenCanvas = Util.createDom('<canvas width="500" height="500"></canvas>');

describe('#556', () => {
  const canvas = new Canvas({
    context,
    offscreenCanvas,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');

  it('canvas supports context and offscreenCanvas props for non-browser env', () => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red'
      }
    });
    canvas.draw();

    // for renderer test
    let clickCalled = false;
    circle.on('click', () => {
      clickCalled = true;
    });
    const bbox = el.getBoundingClientRect();
    Simulate.simulate(el, 'click', {
      clientY: bbox.top + 100,
      clientX: bbox.left + 100,
    });
    expect(clickCalled).eqls(true);

    // for interactive test
    circle.on('mouseenter', () => {
      circle.attr('fill', 'blue');
      canvas.draw();
    });

    circle.on('mouseleave', () => {
      circle.attr('fill', 'red');
      canvas.draw();
    });
  });
});

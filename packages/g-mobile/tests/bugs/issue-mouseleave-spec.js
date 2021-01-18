const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.style.border = '1px solid red';

function simulateMouseEvent(dom, type, cfg) {
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);
}

describe('mouseleave', () => {
  const canvas = new Canvas({
    container: dom,
    width: 100,
    height: 100,
  });

  const g = canvas.addGroup({
    name: 'group',
  });
  g.addShape({
    type: 'rect',
    name: 'test',
    attrs: {
      x: 50,
      y: 90,
      width: 20,
      height: 10,
      fill: 'red',
    },
  });
  const shape = canvas.addShape({
    type: 'rect',
    attrs: {
      x: 50,
      y: 10,
      width: 20,
      height: 50,
      fill: 'red',
    },
  });
  const el = canvas.get('el');
  it('mouseleave test', () => {
    canvas.on('group:mouseenter', (ev) => {
      shape.attr('fill', 'blue');
      ev.shape.attr('fill', 'blue');
    });
    canvas.on('group:mouseleave', (ev) => {
      ev.shape.attr('fill', 'red');
      shape.attr('fill', 'red');
    });
    const point = canvas.getClientByPoint(50, 100);
    simulateMouseEvent(el, 'mouseenter', {
      clientX: point.x,
      clientY: point.y,
    });
    expect(shape.attr('fill')).eql('blue');

    simulateMouseEvent(el, 'mouseout', {
      clientX: point.x,
      clientY: point.y + 1,
    });

    simulateMouseEvent(el, 'mouseleave', {
      clientX: point.x,
      clientY: point.y + 1,
    });
    expect(shape.attr('fill')).eql('red');
  });
});

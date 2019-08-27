const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

function simulateMouseEvent(dom, type, cfg) {
  // esingnore
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);
}

function getClientPoint(canvas, x, y) {
  const point = canvas.getClientByPoint(x, y);
  return {
    clientX: point.x,
    clientY: point.y,
  };
}

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
describe.only('canvas test', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    pixelRatio: 2,
    height: 500,
  });

  it('init', () => {
    expect(canvas.get('width')).eql(500);
    expect(canvas.get('el').width).eql(1000);
    expect(canvas.get('capture')).eql(true);
    expect(canvas.getChildren().length).eql(0);
  });

  it('add group', () => {
    const group = canvas.addGroup();
    expect(group.get('visible')).eql(true);
    expect(canvas.getChildren().length).eql(1);
  });

  it('add shape', () => {
    const circle = canvas.addShape({
      type: 'circle',
      attrs: {
        x: 10,
        y: 10,
        r: 10,
        fill: 'red',
      },
    });
    expect(circle.get('type')).eql('circle');
    expect(circle.attr('r')).eql(10);
  });

  it('draw', () => {
    expect(getColor(canvas.get('context'), 10, 10)).eql('#000000');
    canvas.draw();
    expect(getColor(canvas.get('context'), 10, 10)).eql('#ff0000');
  });

  it('hit', () => {
    const shape = canvas.getShape(10, 10);
    expect(shape.get('type')).eql('circle');
  });

  it('clear', () => {
    canvas.clear();
    expect(getColor(canvas.get('context'), 10, 10)).eql('#000000');
    const shape = canvas.getShape(10, 10);
    expect(shape).eql(null);
    expect(canvas.getChildren().length).eql(0);
  });

  it('group width matrix', () => {});
  it('event click', () => {
    const circle = canvas.addShape({
      type: 'circle',
      attrs: {
        x: 10,
        y: 10,
        r: 10,
        fill: 'red',
      },
    });
    canvas.draw();
    let called = false;
    let clickShape = null;
    canvas.on('click', (ev) => {
      called = true;
      clickShape = ev.shape;
    });
    const { clientX, clientY } = getClientPoint(canvas, 10, 10);
    simulateMouseEvent(canvas.get('el'), 'mousedown', {
      clientX,
      clientY,
    });

    simulateMouseEvent(canvas.get('el'), 'mouseup', {
      clientX,
      clientY,
    });
    expect(called).eql(true);
    expect(clickShape).eql(circle);
  });

  it('destroy', () => {
    canvas.destroy();
    expect(canvas.destroyed).eql(true);
    expect(dom.childNodes.length).eql(0);
  });
});

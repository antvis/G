const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
describe('canvas test', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    pixelRatio: 1,
    height: 500,
  });

  it('init', () => {
    expect(canvas.get('width')).eql(500);
    expect(canvas.get('el').width).eql(500);
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

  it('destroy', () => {
    canvas.destroy();
    expect(canvas.destroyed).eql(true);
    expect(dom.childNodes.length).eql(0);
  });
});

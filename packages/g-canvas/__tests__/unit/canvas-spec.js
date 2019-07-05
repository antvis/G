const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);

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
  });

  it('add group', () => {});

  it('add shape', () => {
    canvas.addShape({
      type: 'circle',
      attrs: {
        x: 10,
        y: 10,
        r: 10,
        fill: 'red',
      },
    });
  });

  it('draw', () => {
    canvas.draw();
  });

  it('clear', () => {});
});

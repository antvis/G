const Simulate = require('event-simulate');
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'c1';
document.body.appendChild(div);

describe('#77', () => {
  const canvas = new Canvas({
    containerId: 'c1',
    renderer: 'svg',
    width: 500,
    height: 500,
    pixelRatio: 1
  });
  const dom = canvas.addShape('dom', {
    attrs: {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      html: '<div>我是 html </div>'
    }
  });
  it('dom点击事件', () => {
    const canvasDOM = canvas.get('el');
    canvas.on('click', () => {
      dom.remove();
      canvas.addShape('dom', {
        attrs: {
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          html: '<div>我是 html </div>'
        }
      });
    });
    canvas.on('dblclick', () => {
      console.log(canvas.getShape(150, 150));
    });
    Simulate.simulate(canvasDOM, 'click', {
      clientX: 150,
      clientY: 150 + canvasDOM.getBoundingClientRect().top
    });
    Simulate.simulate(canvasDOM, 'dblclick', {
      clientX: 150,
      clientY: 150 + canvasDOM.getBoundingClientRect().top
    });
  });
});

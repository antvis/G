const expect = require('chai').expect;
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = '81';
document.body.appendChild(div);

function drawTestGraphic(renderer) {
  // canvas draw
  const canvas = new Canvas({
    containerId: 'c1',
    renderer,
    width: 500,
    height: 500
  });
  const l = 20;
  const gap = 20;
  const path = [
    [ 'M', gap, gap ]
  ];
  for (let index = 0; index < l; index++) {
    for (let j = 0; j < l; j++) {
      const x = index * gap + gap;
      const y = j * gap + gap;
      path.push([ 'L', x, y ]);
    }
  }
  canvas.addShape('path', {
    attrs: {
      path,
      stroke: 'black'
    }
  });
  canvas.draw();
  const circle = canvas.addShape('circle', {
    attrs: {
      x: 100,
      y: 100,
      r: 50,
      fill: '#FA8C16'
    }
  });
  circle.toBack();
  canvas.draw();
  return canvas;
}

describe('#81', () => {
  it('toBack', done => {
    drawTestGraphic('canvas');
    const canvas = drawTestGraphic('svg');
    setTimeout(() => {
      const children = canvas._cfg.el.childNodes;
      expect(children[1].tagName).to.equal('circle');
      expect(children[2].tagName).to.equal('path');
      done();
    }, 100);
  });
});

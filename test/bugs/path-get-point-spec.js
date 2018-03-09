const expect = require('chai').expect;
const Canvas = require('../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-path';
document.body.appendChild(div);

describe('Path', function() {
  it('getPoint path', () => {
    const canvas = new Canvas({
      containerId: 'canvas-path',
      width: 800,
      height: 800,
      pixelRatio: 1
    });
    const path = canvas.addShape('path', {
      attrs: {
        stroke: 'red',
        path: 'M10,10 L50,50 C 20, 10, 30,20, 100,100'
      }
    });
    expect(path.getPoint(0.5)).to.deep.equal({ x: 34.70948802393862, y: 28.70625046294652 });
    canvas.draw();
  });
});

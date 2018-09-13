const expect = require('chai').expect;
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'c1';
document.body.appendChild(div);

describe('#71', () => {
  const canvas = new Canvas({
    containerId: 'c1',
    renderer: 'canvas',
    width: 500,
    height: 500,
    pixelRatio: 1
  });
  it('动画补间优先级', done => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 10,
        fill: 'red'
      }
    });
    circle.animate({
      transform: [
        [ 't', 50, 0 ]
      ]
    }, 2000);
    setTimeout(() => {
      circle.animate({
        transform: [
          [ 't', 0, 50 ]
        ]
      }, 2000);

      expect(circle._cfg.animators.length).to.equal(2);
      expect(circle._cfg.animators[0].toMatrix).to.be.undefined;
      expect(circle._cfg.animators[1].toMatrix).not.to.be.undefined;
      done();
    }, 1000);
  });

});

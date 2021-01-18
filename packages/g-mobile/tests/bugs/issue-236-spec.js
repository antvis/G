const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#236', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('animation for marker should be effective', (done) => {
    const shape = canvas.addShape('marker', {
      attrs: {
        lineWidth: 1,
        fill: '#1890ff',
        r: 16.6,
        opacity: 0.3,
        x: 247.22381317138678,
        y: 153.66500000000002,
        symbol: 'circle',
      },
    });

    shape.animate(
      {
        fill: '#1890ff',
        lineWidth: 1,
        opacity: 0.3,
        r: 16.6,
        stroke: '#1890ff',
        symbol: 'circle',
        x: 457.20191545758945,
        y: 153.66500000000002,
      },
      {
        duration: 100,
      }
    );

    setTimeout(() => {
      expect(shape.attr('x')).eqls(457.20191545758945);
      expect(shape.attr('y')).eqls(153.66500000000002);
      done();
    }, 120);
  });
});

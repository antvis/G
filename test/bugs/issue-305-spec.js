const expect = require('chai').expect;
const G = require('../../src/index');

const div = document.createElement('div');
div.id = '305';
document.body.appendChild(div);

describe('#305', () => {
  it('marker should compatiable with r attr', () => {
    const canvas = new G.Canvas({
      containerId: '305',
      width: 500,
      height: 500,
      pixelRatio: 1
    });
    const marker = canvas.addShape('marker', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
        lineWidth: 4,
        stroke: 'blue',
        symbol: 'circle'
      }
    });
    canvas.draw();
    expect(marker.isHit(100, 100)).eqls(true);
    expect(marker.isHit(100, 151)).eqls(true);
    expect(marker.isHit(100, 160)).eqls(false);
  });
});


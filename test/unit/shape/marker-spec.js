const expect = require('chai').expect;
const Canvas = require('../../../src/canvas');

describe('Marker', function() {
  const div = document.createElement('div');
  div.id = 'canvas-marker';
  document.body.appendChild(div);
  const canvas = new Canvas({
    containerId: 'canvas-marker',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  it('init', function() {
    const marker = canvas.addShape('marker', {
      attrs: {
        x: 10,
        y: 10,
        radius: 10,
        fill: 'red',
        symbol: 'circle'
      }
    });
    expect(marker.attr('x')).to.equal(10);
    expect(marker.attr('y')).to.equal(10);
  });

  it('hit', function() {
    const marker = canvas.addShape('marker', {
      attrs: {
        x: 20,
        y: 20,
        radius: 10,
        fill: 'blue',
        symbol: 'circle'
      }
    });
    expect(marker.isHit(20, 20)).to.be.true;
    expect(marker.isHit(10, 10)).to.be.false;
  });

  it('hit with lineWidth', function() {
    const marker = canvas.addShape('marker', {
      attrs: {
        x: 100,
        y: 100,
        radius: 5,
        lineWidth: 6,
        fill: 'blue',
        symbol: 'circle'
      }
    });
    expect(marker.isHit(100, 100)).to.be.true;
    expect(marker.isHit(95, 95)).to.be.true;
    marker.attr('lineAppendWidth', 6);
    expect(marker.isHit(94, 94)).to.be.true;
  });
});

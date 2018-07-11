/**
 * Created by Elaine on 2018/5/9.
 */
const expect = require('chai').expect;
const Canvas = require('../../../../src/canvas');

describe('Marker', () => {
  const div = document.createElement('div');
  div.id = 'canvas-marker';
  document.body.appendChild(div);
  const canvas = new Canvas({
    containerId: 'canvas-marker',
    width: 200,
    height: 200,
    pixelRatio: 1,
    renderer: 'svg'
  });
  it('init', () => {
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

  it('hit', () => {
    canvas.addShape('marker', {
      attrs: {
        x: 20,
        y: 20,
        radius: 10,
        fill: 'blue',
        symbol: 'diamond'
      }
    });

  });
});

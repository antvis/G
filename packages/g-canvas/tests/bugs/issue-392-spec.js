const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#392', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('should work when r attr is 0 for Marker', () => {
    const marker = canvas.addShape({
      type: 'marker',
      attrs: {
        r: 0,
        fill: '#1890ff',
        symbol: 'circle',
        x: 100,
        y: 100,
      },
    });
    const bbox = marker.getBBox();
    expect(bbox.minX).eqls(100);
    expect(bbox.minY).eqls(100);
    expect(bbox.maxX).eqls(100);
    expect(bbox.maxY).eqls(100);
  });
});

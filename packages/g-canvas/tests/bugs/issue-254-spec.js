const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#254', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('bbox calculation for path should consider angle of 0 and PI', () => {
    const shape = canvas.addShape({
      type: 'path',
      attrs: {
        path: [['M', 300, 500], ['L', 300, 375], ['L', 300, 500], ['Z']],
        lineWidth: 5,
        stroke: 'red',
      },
    });
    const bbox = shape.getBBox();
    expect(bbox.minX).eqls(297.5);
    expect(bbox.minY).eqls(372.5);
    expect(bbox.maxX).eqls(302.5);
    expect(bbox.maxY).eqls(502.5);
  });
});

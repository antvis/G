const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#210', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    height: 500,
  });

  it('bbox calculation should ignore NaN of path', () => {
    const path = canvas.addShape('path', {
      attrs: {
        path: [
          ['M', 100, 100],
          ['L', 200, 200],
          ['L', 300, NaN],
        ],
        stroke: 'red',
      },
    });

    const bbox = path.getBBox();
    expect(bbox.minX).eqls(99.5);
    expect(bbox.minY).eqls(99.5);
    expect(bbox.maxX).eqls(300.5);
    expect(bbox.maxY).eqls(200.5);
  });
});

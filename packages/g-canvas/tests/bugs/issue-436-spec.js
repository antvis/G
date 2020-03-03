const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#436', () => {
  const canvas = new Canvas({
    container: dom,
    width: 1000,
    height: 400,
  });

  it('should consider precision of angle calculation for Path', () => {
    const path = canvas.addShape('path', {
      attrs: {
        stroke: 'red',
        lineWidth: 2,
        path: [
          ['M', 54.88829007174579, 78.53153216848064],
          ['L', 729.5, 78.53153216848064],
          ['L', 729.5, 121.46846783151936],
          ['L', 869.5, 121.46846783151936],
          ['L', 175.11170992825421, 121.46846783151936],
        ],
        endArrow: true,
      },
    });

    const bbox = path.getBBox();
    expect(bbox.minX).eqls(53.88829007174579);
    expect(bbox.minY).eqls(77.53153216848064);
    expect(bbox.maxX).eqls(870.5);
    expect(bbox.maxY).eqls(122.46846783151936);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#287', () => {
  const canvas = new Canvas({
    container: dom,
    width: 1000,
    height: 1000,
  });

  it('should render correctly when start point and end point are same for arc', () => {
    const path = canvas.addShape('path', {
      attrs: {
        stroke: '#444',
        path: [
          ['M', 711.9765625, 265],
          ['L', 759.8580858439664, 86.30372213652237],
          ['A', 185, 185, 0, 0, 1, 759.8580858439664, 86.30372213652237],
          ['L', 711.9765625, 265],
          ['Z'],
        ],
      },
    });
    const bbox = path.getBBox();
    expect(bbox.minX).eqls(711.4765625);
    expect(bbox.minY).eqls(85.80372213652237);
    expect(bbox.maxX).eqls(760.3580858439664);
    expect(bbox.maxY).eqls(265.5);
  });
});

const expect = require('chai').expect;
import Canvas from '../../../g-svg/src/canvas';
import Path from '../../../g-svg/src/shape/path';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#634', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('should get null point on an empty path', () => {
    const path = new Path({
      attrs: {
        path: [
          ['M', 0, 0],
          ['L', 0, 0],
        ],
        lineWidth: 1,
        stroke: 'red',
      },
    });
    canvas.add(path);
    expect(path.getPoint(0)).eqls(null);
  });
});

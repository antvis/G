const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#240', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('should get correct path for marker', () => {
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

    const el = shape.get('el');
    const path = el.getAttribute('d');
    expect(path).eqls(
      'M 247.22381317138678 153.66500000000002m -16.6 0a 16.6 16.6 0 1 0 33.2 0a 16.6 16.6 0 1 0 -33.2 0'
    );
  });
});

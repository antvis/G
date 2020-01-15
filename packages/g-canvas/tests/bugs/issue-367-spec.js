const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#367', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });

  const context = canvas.get('context');

  it('path with relative command should work correctly for Marker', (done) => {
    canvas.addShape('marker', {
      attrs: {
        r: 50,
        x: 100,
        y: 100,
        fill: 'red',
        stroke: 'blue',
        lineWidth: 2,
        symbol: (x, y, r) => {
          return [
            ['M', x - r, y],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x - r + 4, y],
            ['L', x - r + 2 * r - 4, y],
            ['M', x - r + r, y - r + 4],
            ['L', x, y + r - 4],
          ];
        },
      },
    });

    setTimeout(() => {
      expect(getColor(context, 100, 100)).eqls('#0000ff');
      expect(getColor(context, 110, 110)).eqls('#ff0000');
      done();
    }, 25);
  });
});

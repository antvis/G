const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#350', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    attrs: {
      matrix: [0.5, 0, 0, 0, 0.5, 0, 0, 0, 1],
    },
    pixelRatio: 1,
  });

  const context = canvas.get('context');

  it('matrix attr for canvas should work correctly', (done) => {
    canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });
    setTimeout(() => {
      // center of circle
      expect(getColor(context, 50, 50)).eqls('#ff0000');
      done();
    }, 25);
  });
});

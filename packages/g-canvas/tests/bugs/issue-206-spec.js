const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#187', () => {
  const canvas = new Canvas({
    container: dom,
    pixelRatio: 1,
    width: 500,
    height: 500,
  });

  const context = canvas.get('context');

  it('non-array value should be compatible with lineDash', (done) => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 40,
        lineWidth: 5,
        fill: 'red',
        stroke: 'blue',
      },
    });
    circle.attr('lineDash', [40, 40]);
    setTimeout(() => {
      expect(getColor(context, 100, 100 + 41)).eqls('#000000');
      expect(getColor(context, 100, 100 - 41)).eqls('#0000ff');
      // null should be equivalent to empty array
      circle.attr('lineDash', null);
      setTimeout(() => {
        expect(getColor(context, 100, 100 + 41)).eqls('#0000ff');
        expect(getColor(context, 100, 100 - 41)).eqls('#0000ff');
        done();
      }, 25);
    }, 25);
  });
});

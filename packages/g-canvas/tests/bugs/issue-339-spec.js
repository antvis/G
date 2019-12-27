const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#339', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });
  const context = canvas.get('context');

  it('sort method should work when zIndex is changed', (done) => {
    const group = canvas.addGroup();
    const rect = group.addShape('rect', {
      attrs: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      },
    });

    group.addShape('circle', {
      attrs: {
        x: 150,
        y: 150,
        r: 60,
        fill: 'blue',
      },
    });
    // rect is behind of circle
    setTimeout(() => {
      expect(getColor(context, 150, 150)).eqls('#0000ff');

      rect.set('zIndex', 1);
      group.sort();
      // rect is front of circle
      setTimeout(() => {
        expect(getColor(context, 150, 150)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });
});

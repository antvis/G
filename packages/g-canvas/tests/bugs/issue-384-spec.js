const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#384', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
    pixelRatio: 1,
  });

  const context = canvas.get('context');

  it('setZIndex for Element', (done) => {
    // circle1
    const circle1 = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
      // zIndex is 0 for element by default
      // zIndex: 0
    });
    // circle2
    const circle2 = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 20,
        fill: 'blue',
      },
    });
    const children = canvas.getChildren();
    expect(children).eqls([circle1, circle2]);
    setTimeout(() => {
      expect(getColor(context, 100, 100)).eqls('#0000ff');
      circle2.setZIndex(-1);
      expect(children).eqls([circle2, circle1]);
      setTimeout(() => {
        expect(getColor(context, 100, 100)).eqls('#ff0000');
        done();
      }, 25);
    }, 25);
  });
});

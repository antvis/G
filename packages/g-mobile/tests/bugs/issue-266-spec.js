const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getTextColorCount } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#266', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });

  const context = canvas.get('context');

  it('stroke attr should be working for Text', (done) => {
    canvas.addShape('text', {
      attrs: {
        x: 100,
        y: 100,
        text: 'This is text',
        fontSize: 60,
        stroke: 'red',
        textBaseline: 'top',
      },
    });
    setTimeout(() => {
      expect(getTextColorCount(context, 110, 110, 50, '#ff0000') > 0).eqls(true);
      done();
    }, 25);
  });
});

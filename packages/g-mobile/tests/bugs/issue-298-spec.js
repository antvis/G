const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getTextColorCount } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#298', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });
  const context = canvas.get('context');

  it('strokeText should be invoked before fillText for text', (done) => {
    canvas.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: '文本效果',
        fill: 'blue',
        stroke: 'red',
        lineWidth: 5,
        fontSize: 40,
        textBaseline: 'top',
      },
    });
    setTimeout(() => {
      expect(getTextColorCount(context, 20, 20, 20, '#ff0000') > 0).eqls(true);
      expect(getTextColorCount(context, 20, 20, 20, '#0000ff') > 0).eqls(true);
      done();
    }, 25);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);

describe('#444', () => {
  const pixelRatio = 1.3;
  const canvas = new Canvas({
    container: dom,
    width: 1000,
    height: 400,
    pixelRatio,
  });
  const context = canvas.get('context');
  const line = canvas.addShape({
    type: 'line',
    attrs: {
      x1: 229,
      y1: 0,
      x2: 229,
      y2: 100,
      stroke: 'red',
      lineWidth: 1.5,
    },
  });
  const arr = [
    175.84088874080578,
    186.12206002239975,
    196.5130830703088,
    206.84747231409375,
    217.09029046810176,
    227.54951033487814,
    238.06394166293776,
    248.29101292282533,
    258.8908922907962,
    269.7191946392174,
  ];
  let count = 0;
  function changePosition() {
    const x = arr[count];
    line.attr({
      x1: x,
      x2: x,
    });
    if (count < 10) {
      setTimeout(() => {
        count++;
        changePosition();
      }, 50);
    }
  }
  changePosition();
  it('refresh', (done) => {
    setTimeout(() => {
      expect(getColor(context, 206 * pixelRatio, 2)).eql('#000000');
      done();
    }, 300);
  });
});

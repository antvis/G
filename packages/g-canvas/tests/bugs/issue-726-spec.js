const expect = require('chai').expect;
import { Canvas } from '../../src';
const container = document.createElement('canvas');
document.body.appendChild(container);

describe('#726', () => {
  it('Total canvas memory use exceeds xxxMB bug', () => {
    const canvas = new Canvas({
      container,
      width: 600,
      height: 500,
    });

    const canvasEl = canvas.get('el');
    const pixelRatio = canvas.getPixelRatio();

    expect(canvasEl.width).eql(600 * pixelRatio);
    expect(canvasEl.height).eql(500 * pixelRatio);

    canvas.destroy();

    // 销毁canvas后需要设置宽高为0
    // 解决ios场景下 canvas无法进行垃圾回收的问题
    expect(canvasEl.width).eql(0);
    expect(canvasEl.height).eql(0);
  });
});

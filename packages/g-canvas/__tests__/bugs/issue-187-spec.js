const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#187', () => {
  const canvas = new Canvas({
    container: dom,
    autoDraw: true,
    width: 1000,
    height: 1000,
  });

  const context = canvas.get('context');
  const pixelRatio = canvas.getPixelRatio();

  it('pixelRatio should be effective', (done) => {
    const group = canvas.addGroup();
    group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 10,
        fill: 'red',
      },
    });

    setTimeout(() => {
      // getColor 函数获取的是实际渲染的图形，内部没有处理缩放逻辑，因此需要外部传入缩放后的坐标值
      expect(getColor(context, 100 * pixelRatio, 100 * pixelRatio)).eqls('#ff0000');
      expect(getColor(context, 100 * pixelRatio, (100 + 9) * pixelRatio)).eqls('#ff0000');
      done();
    }, 25);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#323', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    pixelRatio: 1,
  });
  const context = canvas.get('context');

  /**
   * 动画不生效的两个原因:
   * 1. 判断重新渲染没有考虑 clip 的包围盒是否与 refreshRegion 相交
   * 2. clip 的绘图属性没有挂载到 context 上
   */
  it('matrix animation for clip should work', (done) => {
    const group = canvas.addGroup();
    const path = group.addShape({
      type: 'path',
      attrs: {
        path: [
          ['M', 10, 10],
          ['L', 33, 15],
          ['L', 65, 10],
          ['L', 140, 60],
        ],
        stroke: 'red',
        lineWidth: 1,
      },
    });
    // shape 上设置 clip
    const clipShape1 = path.setClip({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        matrix: [0.01, 0, 0, 0, 1, 0, 0, 0, 1],
      },
    });
    // group 上设置 clip
    const clipShape2 = group.setClip({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      },
    });
    // 通过获取 path 中点的颜色，来判断动画是否执行
    setTimeout(() => {
      expect(getColor(context, 33, 15)).eqls('#000000');
      expect(getColor(context, 65, 10)).eqls('#000000');
    }, 0);
    clipShape1.animate(
      {
        matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      },
      {
        duration: 500,
      }
    );
    clipShape2.animate(
      {
        matrix: [0.01, 0, 0, 0, 1, 0, 0, 0, 1],
      },
      {
        delay: 500,
        duration: 500,
      }
    );
    // clipShape1 的动画执行到一半
    setTimeout(() => {
      expect(getColor(context, 33, 15)).eqls('#ff0000');
      expect(getColor(context, 65, 10)).eqls('#ff0000');
    }, 250);
    // clipShape1 的动画执行结束
    setTimeout(() => {
      expect(getColor(context, 33, 15)).eqls('#ff0000');
      expect(getColor(context, 65, 10)).eqls('#ff0000');
    }, 500);
    // clipShape2 的动画执行到一半
    setTimeout(() => {
      expect(getColor(context, 33, 15)).eqls('#ff0000');
      expect(getColor(context, 65, 10)).eqls('#ff0000');
    }, 750);
    // clipShape2 的动画执行结束
    setTimeout(() => {
      expect(getColor(context, 33, 15)).eqls('#000000');
      expect(getColor(context, 65, 10)).eqls('#000000');
      done();
    }, 1000);
  });
});

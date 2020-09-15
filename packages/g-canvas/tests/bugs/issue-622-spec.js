const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid black';
dom.style.display = 'inline-block';

describe('#622', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');
  const context = canvas.get('context');
  const pixelRatio = canvas.getPixelRatio();

  it('hasChanged should have priority over refresh with in checkChildrenRefresh function', (done) => {
    const group = canvas.addGroup();

    const circle = group.addShape('circle', {
      draggable: true,
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: '#f00',
      },
    });

    const rect = group.addShape('rect', {
      attrs: {
        x: 100,
        y: 100,
        fill: '#0f0',
        width: 100,
        height: 50,
      },
    });

    rect.animate(
      {
        width: 50,
      },
      {
        duration: 1000,
        repeat: true,
      }
    );

    let previousX = 0;
    let previousY = 0;

    circle.on('dragstart', (e) => {
      previousX = e.clientX;
      previousY = e.clientY;
    });

    circle.on('drag', (e) => {
      const dx = e.clientX - previousX;
      const dy = e.clientY - previousY;
      group.translate(dx, dy);
      previousX = e.clientX;
      previousY = e.clientY;
    });

    /* 先将 group 完全拖离视窗，并点击画布 */
    // 先移动到 circle 上
    const { clientX, clientY } = getClientPoint(canvas, 90, 90);
    // 按下鼠标
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    // 先移动 10 像素，触发 dragstart 事件
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 10,
    });
    // // 往回移动 10px 回到起始地点
    // // 要模拟 drag 事件，需要触发 mousemove 事件两次及以上。因为第一次 mousemove 事件是用来触发 dragstart 事件的
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY,
    });
    // 将 group 完全拖离视窗，这里通过鼠标离开画布足够距离(点击处上方 200 的位置)进行模拟
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 200,
    });
    // 将 group 拖拽回起始位置
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 10,
    });
    // 松开鼠标，停止拖拽
    simulateMouseEvent(el, 'mouseup', {
      clientX,
      clientY,
    });
    const canvasBBox = group.getCanvasBBox();
    // 判断 group 是否拖拽回起始位置
    expect(canvasBBox.maxY).eqls(150);
    setTimeout(() => {
      // 判断 circle 能否正常渲染
      expect(getColor(context, 90 * pixelRatio, 90 * pixelRatio)).eqls('#ff0000');
      done();
    }, 25);
  });
});

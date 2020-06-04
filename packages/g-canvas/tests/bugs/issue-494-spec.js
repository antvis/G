const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid black';
dom.style.display = 'inline-block';

describe('#494', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');
  const context = canvas.get('context');
  const pixelRatio = canvas.getPixelRatio();

  it('render should work correctly when element is clipped by view', (done) => {
    const group = canvas.addGroup();
    const rect = group.addShape('rect', {
      draggable: true,
      attrs: {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 4,
        height: 40,
        width: 40,
        x: 100,
        y: 100,
      },
    });

    canvas.on('click', () => {
      group.translate(0, 200);
    });

    let origin = {};

    rect.on('dragstart', (e) => {
      origin = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    rect.on('drag', (e) => {
      const clientX = +e.clientX;
      const clientY = +e.clientY;
      if (isNaN(clientX) || isNaN(clientY)) {
        return;
      }

      group.translate(clientX - origin.x, clientY - origin.y);
      origin = {
        x: clientX,
        y: clientY,
      };
    });

    /* 先将 rect 完全拖离视窗，并点击画布 */
    // 先移动到 rect 上
    const { clientX, clientY } = getClientPoint(canvas, 100, 100);
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY,
    });
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
    // 要模拟 drag 事件，需要触发 mousemove 事件两次及以上。因为第一次 mousemove 事件是用来触发 dragstart 事件的
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 20,
    });
    // 将 rect 完全拖离视窗，这里通过鼠标离开画布足够距离进行模拟，拖拽距离共 200 = 210 - 10
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 210,
    });
    // 松开鼠标，停止拖拽
    simulateMouseEvent(el, 'mouseup', {
      clientX,
      clientY: clientY - 200,
    });
    let canvasBBox = group.getCanvasBBox();
    // 判断 rect 是否完全拖离画布
    expect(canvasBBox.maxY).eqls(-58);
    // 按下鼠标
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX,
      clientY,
    });
    canvasBBox = group.getCanvasBBox();
    // 判断 rect 是否移动回画布
    expect(canvasBBox.maxY).eqls(142);
    setTimeout(() => {
      // stroke 判断
      expect(getColor(context, 100 * pixelRatio, 100 * pixelRatio)).eqls('#0000ff');
      // fill 判断
      expect(getColor(context, (100 + 10) * pixelRatio, (100 + 10) * pixelRatio)).eqls('#ff0000');
      done();
    }, 25);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#456', () => {
  const canvas = new Canvas({
    container: dom,
    width: 1000,
    height: 400,
  });

  const el = canvas.get('el');

  it('dragenter & dragleave event should be able to bubble', () => {
    // rect1
    canvas.addShape('rect', {
      name: 'rect1',
      attrs: {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        fill: '#f00',
      },
    });

    // rect2
    const rect2 = canvas.addShape('rect', {
      draggable: true,
      name: 'rect2',
      attrs: {
        x: 0,
        y: 100,
        width: 50,
        height: 50,
        fill: '#ff0',
      },
    });

    let dragCalled = false;
    let dragenterCalled = false;
    let dragoverCalled = false;
    let dragleaveCalled = false;

    canvas.on('dragenter', () => {
      dragenterCalled = true;
    });

    canvas.on('dragover', () => {
      dragoverCalled = true;
    });

    canvas.on('dragleave', () => {
      dragleaveCalled = true;
    });

    canvas.on('rect2:drag', (e) => {
      dragCalled = true;
      rect2.attr({
        x: e.x - 10,
        y: e.y - 10,
      });
    });

    const { clientX, clientY } = getClientPoint(canvas, 25, 125);
    // 鼠标按下
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    // 鼠标移动，触发 dragstart 事件
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 10,
      clientY,
    });
    // 鼠标再次移动，才会触发 drag 事件
    // 要模拟 drag 事件，需要触发 mousemove 事件两次及以上。因为第一次 mousemove 事件是用来触发 dragstart 事件的
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 20,
      clientY,
    });
    expect(dragCalled).eqls(true);

    // 拖拽从下边缘进入 rect1
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 80,
    });
    expect(dragenterCalled).eqls(true);

    // 在 rect1 中拖拽
    simulateMouseEvent(el, 'mousemove', {
      clientX,
      clientY: clientY - 100,
    });
    expect(dragoverCalled).eqls(true);

    // 拖拽从右边缘离开 rect1
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 50,
      clientY: clientY - 100,
    });
    expect(dragleaveCalled).eqls(true);
  });
});

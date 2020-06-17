const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid black';

describe('#380', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');

  function triggerEvent() {
    const { clientX, clientY } = getClientPoint(canvas, 200, 200);
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });

    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 10,
      clientY,
    });

    // 要模拟 drag 事件，需要触发 mousemove 事件两次及以上。因为第一次 mousemove 事件是用来触发 dragstart 事件的
    simulateMouseEvent(el, 'mousemove', {
      clientX: clientX + 20,
      clientY,
    });

    simulateMouseEvent(el, 'mouseup', {
      clientX: clientX + 30,
      clientY,
    });
  }

  it('should emit drag event for canvas only when draggable is true', () => {
    canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });

    let dragstartCalled = false;
    let dragCalled = false;
    let dragendCalled = false;
    let mousedownCalled = false;
    let mousemoveCalled = false;
    let mouseupCalled = false;
    let clickCalled = false;

    canvas.on('dragstart', () => {
      dragstartCalled = true;
    });

    canvas.on('drag', () => {
      dragCalled = true;
    });

    canvas.on('dragend', () => {
      dragendCalled = true;
    });

    canvas.on('mousedown', () => {
      mousedownCalled = true;
    });

    canvas.on('mousemove', () => {
      mousemoveCalled = true;
    });

    canvas.on('mouseup', () => {
      mouseupCalled = true;
    });

    canvas.on('click', () => {
      clickCalled = true;
    });

    // 触发模拟事件
    triggerEvent();

    expect(dragstartCalled).eqls(false);
    expect(dragCalled).eqls(false);
    expect(dragendCalled).eqls(false);
    expect(mousedownCalled).eqls(true);
    expect(mousemoveCalled).eqls(true);
    expect(mouseupCalled).eqls(true);
    expect(clickCalled).eqls(true);

    // 重置标记
    dragstartCalled = false;
    dragCalled = false;
    dragendCalled = false;
    mousedownCalled = false;
    mousemoveCalled = false;
    mouseupCalled = false;
    clickCalled = false;

    // 设置 canvas 可拖拽
    canvas.set('draggable', true);
    // 触发模拟事件
    triggerEvent();

    expect(dragstartCalled).eqls(true);
    expect(dragCalled).eqls(true);
    expect(dragendCalled).eqls(true);
    expect(mousedownCalled).eqls(true);
    // mousemove 是否触发取决于拖拽的速度和距离。由于事件是模拟的，不太好把握拖拽的速度和距离，因此这里不会触发 mousemove 事件
    // 实际上如果拖拽较快的话，mousemove 会在 dragstart 事件之前触发
    expect(mousemoveCalled).eqls(false);
    expect(mouseupCalled).eqls(false);
    expect(clickCalled).eqls(false);
  });
});

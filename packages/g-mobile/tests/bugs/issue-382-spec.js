const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#382', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    height: 500,
  });

  const el = canvas.get('el');

  it('matrix of element should affect its clip', () => {
    const group = canvas.addGroup();
    const shape = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });
    // X 方向移动 100
    shape.translate(100, 0);
    shape.setClip({
      type: 'rect',
      attrs: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      },
    });
    let clickCalled = false;
    shape.on('click', () => {
      clickCalled = true;
    });

    // 加上以下两个事件监听，主要是为了在 interactive 测试模式下，能更直观的感受拾取是否符合预期
    shape.on('mouseenter', () => {
      shape.attr('fill', 'blue');
    });

    shape.on('mouseleave', () => {
      shape.attr('fill', 'red');
    });

    const { clientX, clientY } = getClientPoint(canvas, 200, 100);
    simulateMouseEvent(el, 'mousedown', {
      clientX: clientX - 10,
      clientY: clientY + 10,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX: clientX - 10,
      clientY: clientY + 10,
    });
    expect(clickCalled).eqls(false);
    simulateMouseEvent(el, 'mousedown', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });
    expect(clickCalled).eqls(true);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#370', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  const el = canvas.get('el');

  it('mouseup and click event should not be emitted when contextmenu emitted', () => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 50,
        y: 50,
        r: 30,
        fill: 'red',
      },
    });
    let contextmenuCalled = false;
    let clickCalled = false;
    // 由于 simulateMouseEvent 模拟的 contextmenu 事件不会触发 mousedown，因此将 mousedown 相关的测试代码进行了注释
    // 要想查看实际测试效果，可以在 interactive 模式下手动触发 contextmenu 事件进行测试
    // let mousedownCalled = false;
    let mouseupCalled = false;

    circle.on('contextmenu', () => {
      contextmenuCalled = true;
    });

    circle.on('click', () => {
      clickCalled = true;
    });

    // circle.on('mousedown', () => {
    //   console.log('mousedown')
    //   mousedownCalled = true;
    // });

    circle.on('mouseup', () => {
      mouseupCalled = true;
    });

    const { clientX, clientY } = getClientPoint(canvas, 30, 30);

    simulateMouseEvent(el, 'contextmenu', {
      clientX,
      clientY,
    });

    expect(contextmenuCalled).eqls(true);
    // expect(mousedownCalled).eqls(true);
    expect(clickCalled).eqls(false);
    expect(mouseupCalled).eqls(false);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';

function simulateMouseEvent(dom, type, cfg) {
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);
}

const dom = document.createElement('div');
document.body.appendChild(dom);

describe('drag', () => {
  const canvas = new Canvas({
    container: dom,
    width: 300,
    height: 300,
    // pixelRatio: 1,
  });
  const el = canvas.get('el');
  el.style.border = '1px solid red';
  function notInCanvas(ev) {
    return ev.x < 0 || ev.x > 300 || ev.y < 0 || ev.y > 300;
  }
  it('text drag', () => {
    let drag = false;
    let end = false;
    canvas.on('drag', (ev) => {
      if (notInCanvas(ev)) {
        drag = true;
      }
    });

    canvas.on('dragend', (ev) => {
      if (notInCanvas(ev)) {
        end = true;
      }
    });
    const group = canvas.addGroup();
    group.addShape('text', {
      draggable: true,
      attrs: {
        x: 100,
        y: 100,
        text: '12345678',
        fill: '#8d8d8d',
        fontSize: 12,
        textBaseline: 'middle',
        textAlign: 'left',
        fontFamily: `
  "-apple-system", BlinkMacSystemFont, "Segoe UI", Roboto,"Helvetica Neue",
  Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  SimSun, "sans-serif"`,
      },
    });
    const point = canvas.getClientByPoint(100, 100);
    // 点击
    simulateMouseEvent(el, 'mousedown', {
      clientX: point.x,
      clientY: point.y,
    });
    // 触发拖拽
    simulateMouseEvent(el, 'mousemove', {
      clientX: point.x + 10,
      clientY: point.y,
    });
    expect(drag).eql(false);
    // 在画布外移动
    simulateMouseEvent(el, 'mousemove', {
      clientX: point.x - 110,
      clientY: point.y,
    });
    expect(drag).eql(true);
    expect(end).eql(false);
    simulateMouseEvent(el, 'mouseup', {
      clientX: point.x - 110,
      clientY: point.y,
    });
    expect(end).eql(true);
  });
});

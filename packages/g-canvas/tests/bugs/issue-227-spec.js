const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#187', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  const el = canvas.get('el');

  it.only('event delegation on shape should be effective', () => {
    const group = canvas.addGroup({
      name: 'group',
    });
    group.addShape('circle', {
      name: 'circle',
      attrs: {
        x: 100,
        y: 100,
        r: 30,
        fill: 'red',
      },
    });
    const arr = [];

    // 监听画布的点击事件
    canvas.on('click', () => {
      arr.push('canvas');
    });

    // 通过事件代理监听 group 的点击事件
    canvas.on('group:click', () => {
      arr.push('group');
    });

    // 通过事件代理监听 circle 的点击事件
    canvas.on('circle:click', () => {
      arr.push('circle');
    });

    const { clientX, clientY } = getClientPoint(canvas, 100, 100);
    // 通过 mousedown 和 mouseup 模拟 click 事件
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    simulateMouseEvent(el, 'mouseup', {
      clientX,
      clientY,
    });
    expect(arr).eqls(['circle', 'group', 'canvas']);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { simulateMouseEvent, getClientPoint } from '../util';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#249', () => {
  it('event attrs should be correct when emit event on shape', (done) => {
    const canvas = new Canvas({
      container: dom,
      width: 600,
      height: 600,
    });
    const el = canvas.get('el');
    const groupDelegateObject = { a: 1, b: 2 };
    const circleDelegateObject = { x: 1, y: 2 };
    const group = canvas.addGroup({
      name: 'group',
      delegateObject: groupDelegateObject,
    });
    const circle = group.addShape('circle', {
      name: 'circle',
      delegateObject: circleDelegateObject,
      attrs: {
        x: 50,
        y: 50,
        r: 50,
        fill: 'red',
      },
    });

    // canvas * 事件触发的次数
    let canvasEventCount = 0;
    // group * 事件触发的次数
    let groupEventCount = 0;

    // 共触发 3 次
    canvas.on('*', (e) => {
      canvasEventCount++;
      // 事件会触发多次，且每次的 e.name 都不同
      if (canvasEventCount === 1) {
        expect(e.name).eqls('circle:mousedown');
        expect(e.currentTarget).eqls(circle);
        expect(e.delegateObject).eqls(circleDelegateObject);
      } else if (canvasEventCount === 2) {
        expect(e.name).eqls('group:mousedown');
        expect(e.currentTarget).eqls(group);
        expect(e.delegateObject).eqls(groupDelegateObject);
      } else if (canvasEventCount === 3) {
        expect(e.name).eqls('mousedown');
        expect(e.currentTarget).eqls(canvas);
      }
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.delegateTarget).eqls(canvas);
    });

    canvas.on('mousedown', (e) => {
      expect(e.name).eqls('mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(canvas);
      expect(e.delegateTarget).eqls(canvas);
    });

    canvas.on('group:mousedown', (e) => {
      expect(e.name).eqls('group:mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(group);
      expect(e.delegateTarget).eqls(canvas);
      expect(e.delegateObject).eqls(groupDelegateObject);
    });

    canvas.on('circle:mousedown', (e) => {
      expect(e.name).eqls('circle:mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(circle);
      expect(e.delegateTarget).eqls(canvas);
      expect(e.delegateObject).eqls(circleDelegateObject);
    });

    // 共触发 2 次
    group.on('*', (e) => {
      groupEventCount++;
      if (groupEventCount === 1) {
        expect(e.name).eqls('circle:mousedown');
        expect(e.currentTarget).eqls(circle);
        expect(e.delegateObject).eqls(circleDelegateObject);
      } else if (groupEventCount === 2) {
        expect(e.name).eqls('mousedown');
        expect(e.currentTarget).eqls(group);
      }
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.delegateTarget).eqls(group);
    });

    group.on('mousedown', (e) => {
      expect(e.name).eqls('mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(group);
      expect(e.delegateTarget).eqls(group);
    });

    group.on('circle:mousedown', (e) => {
      expect(e.name).eqls('circle:mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(circle);
      expect(e.delegateTarget).eqls(group);
      expect(e.delegateObject).eqls(circleDelegateObject);
    });

    circle.on('mousedown', (e) => {
      expect(e.name).eqls('mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(circle);
      expect(e.currentTarget).eqls(circle);
      expect(e.delegateTarget).eqls(circle);
    });

    // emit event on shape
    const { clientX, clientY } = getClientPoint(canvas, 50, 50);
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
    setTimeout(() => {
      done();
    }, 500);
  });

  it('event attrs should be correct when emit event on canvas', () => {
    const canvas = new Canvas({
      container: dom,
      width: 600,
      height: 600,
    });

    const el = canvas.get('el');
    const group = canvas.addGroup({
      name: 'group',
    });
    group.addShape('circle', {
      name: 'circle',
      attrs: {
        x: 50,
        y: 50,
        r: 50,
        fill: 'red',
      },
    });

    canvas.on('*', (e) => {
      expect(e.name).eqls('mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(canvas);
      expect(e.currentTarget).eqls(canvas);
      expect(e.delegateTarget).eqls(canvas);
    });

    canvas.on('mousedown', (e) => {
      expect(e.name).eqls('mousedown');
      expect(e.type).eqls('mousedown');
      expect(e.target).eqls(canvas);
      expect(e.currentTarget).eqls(canvas);
      expect(e.delegateTarget).eqls(canvas);
    });

    // emit event on canvas
    const { clientX, clientY } = getClientPoint(canvas, 100, 100);
    simulateMouseEvent(el, 'mousedown', {
      clientX,
      clientY,
    });
  });
});

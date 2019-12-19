const expect = require('chai').expect;
import GraphEvent from '../../src/event/graph-event';
import EventController from '../../src/event/event-contoller';
import Canvas from '../../src/abstract/canvas';
import Shape from '../../src/abstract/shape';
import Group from '../../src/abstract/group';

import { simulateMouseEvent } from '../simulate';

const dom = document.createElement('div');
document.body.appendChild(dom);

class MyShape extends Shape {
  calculateBBox() {
    const { x, y, width, height } = this.attrs;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
  // 都是靠 bbox 进行拾取
  isOnlyHitBox() {
    return true;
  }
}

class MyGroup extends Group {
  getShapeBase() {
    return MyShape;
  }
  getGroupBase() {
    return MyGroup;
  }
}

class MyCanvas extends Canvas {
  createDom() {
    const el = document.createElement('canvas');
    return el;
  }

  getShapeBase() {
    return MyShape;
  }

  getGroupBase() {
    return MyGroup;
  }
}

class MyCircle extends MyShape {
  calculateBBox() {
    const { x, y, r } = this.attrs;
    return {
      minX: x - r,
      minY: y - r,
      maxX: x + r,
      maxY: y + r,
    };
  }
}

MyShape.Circle = MyCircle;

describe('test event object', () => {
  let prevent = false;
  const mockEvent = {
    preventDefault() {
      prevent = true;
    },
  };
  const event = new GraphEvent('custom', mockEvent);
  it('init', () => {
    expect(event.type).eql('custom');
    expect(event.originalEvent).eql(mockEvent);
    expect(event.propagationStopped).eql(false);
  });

  it('preventDefault', () => {
    event.preventDefault();
    expect(prevent).eql(true);
    expect(event.defaultPrevented).eql(true);
  });

  it('stopPropagation', () => {
    event.stopPropagation();
    expect(event.propagationStopped).eql(true);
  });

  it('toString', () => {
    expect(event.toString()).eql('[Event (type=custom)]');
  });
});

describe('test graphic events', () => {
  const canvas = new MyCanvas({
    container: dom,
    width: 500,
    height: 500,
  });
  const element = canvas.get('el');

  function getClientPoint(x, y) {
    const point = canvas.getClientByPoint(x, y);
    return {
      clientX: point.x,
      clientY: point.y,
    };
  }

  const shape1 = canvas.addShape({
    type: 'circle',
    attrs: {
      x: 10,
      y: 10,
      r: 5,
      fill: 'red',
    },
  });

  const shape2 = canvas.addShape({
    type: 'circle',
    attrs: {
      x: 20,
      y: 10,
      r: 5,
      fill: 'blue',
    },
  });

  // 单测中没用到这个图形
  // const shape3 = canvas.addShape({
  //   type: 'circle',
  //   attrs: {
  //     x: 100,
  //     y: 100,
  //     r: 5,
  //     fill: 'yellow'
  //   }
  // });

  const group1 = canvas.addGroup();
  const group11 = group1.addGroup();
  const group12 = group1.addGroup();
  const shape4 = group11.addShape({
    type: 'circle',
    attrs: {
      x: 200,
      y: 200,
      r: 5,
      fill: 'blue',
    },
  });

  const shape5 = group11.addShape({
    type: 'circle',
    attrs: {
      x: 210,
      y: 210,
      r: 5,
      fill: 'blue',
    },
  });

  const shape6 = group12.addShape({
    type: 'circle',
    attrs: {
      x: 220,
      y: 220,
      r: 5,
      fill: 'blue',
    },
  });

  const controller = new EventController({ canvas });
  controller.init();

  it('ishit', () => {
    expect(canvas.getShape(9, 9)).eql(shape1);
    expect(canvas.getShape(4, 4)).eql(null);
  });

  it('init controller', () => {
    expect(controller.canvas).eql(canvas);
  });

  it('mousedown', () => {
    const { clientX, clientY } = getClientPoint(10, 10);
    let called = false;
    let triggerShape;
    shape1.on('mousedown', (ev) => {
      called = true;
      triggerShape = ev.shape;
    });
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(called).eql(true);
    expect(triggerShape).eql(shape1);
    shape1.off('mousedown');
    called = false;
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(called).eql(false);
  });

  it('mouseup', () => {
    const { clientX, clientY } = getClientPoint(21, 11);
    let called = false;
    let triggerShape;
    shape2.on('mouseup', (ev) => {
      called = true;
      triggerShape = ev.shape;
    });

    let canvasCalled = false;
    canvas.on('mouseup', () => {
      canvasCalled = true;
    });

    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });

    expect(called).eql(true);
    expect(triggerShape).eql(shape2);
    expect(canvasCalled).eql(true);
    shape2.off();

    called = false;
    canvasCalled = false;
    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });
    expect(called).eql(false);
    expect(canvasCalled).eql(true);
    canvas.off();
  });

  it('no shape mouse event', () => {
    let called = false;
    let triggerShape;
    canvas.on('mousedown', (ev) => {
      called = true;
      triggerShape = ev.shape;
    });
    const { clientX, clientY } = getClientPoint(30, 30);
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });

    expect(called).eql(true);
    expect(triggerShape).eql(null);
  });

  it('click', () => {
    let called = false;
    let triggerShape;
    shape1.on('click', (ev) => {
      called = true;
      triggerShape = ev.shape;
    });
    const { clientX, clientY } = getClientPoint(10, 10);
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(called).eql(false);
    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });
    expect(called).eql(true);
    expect(triggerShape).eql(shape1);
    shape1.off();
  });

  it('mousedown ,up and move', () => {
    let called = false;
    shape1.on('click', () => {
      called = true;
    });
    const { clientX, clientY } = getClientPoint(10, 10);
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(called).eql(false);
    simulateMouseEvent(element, 'mouseup', {
      clientX: clientX + 10,
      clientY,
    });
    expect(called).eql(false);
    shape1.off();
  });

  it('mousemove', () => {
    let canvasCalled = false;
    let count = 0;
    let triggerShape = null;
    canvas.on('mousemove', (ev) => {
      canvasCalled = true;
      count++;
      triggerShape = ev.shape;
    });
    const { clientX, clientY } = getClientPoint(4, 4);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    expect(count).eql(1);
    expect(triggerShape).eql(null);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 5,
      clientY: clientY + 5,
    });

    expect(count).eql(2);
    expect(triggerShape).eql(shape1);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 20,
      clientY: clientY + 20,
    });

    expect(count).eql(3);
    expect(canvasCalled).eql(true);
    expect(triggerShape).eql(null);
  });

  it('mouseenter, mouseover', () => {
    let canvasCalled = false;
    canvas.on('mouseenter', () => {
      canvasCalled = true;
    });
    let canvasOverCalled = false;
    canvas.on('mouseover', () => {
      canvasOverCalled = true;
    });
    let enterCalled = false;
    let fromShape;
    let toShape;
    shape1.on('mouseenter', (ev) => {
      enterCalled = true;
      fromShape = ev.fromShape;
      toShape = ev.toShape;
    });

    const { clientX, clientY } = getClientPoint(10, 10);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    expect(enterCalled).eql(true);
    expect(canvasOverCalled).eql(true);
    expect(canvasCalled).eql(false);
    expect(fromShape).eql(null);
    expect(toShape).eql(shape1);
    shape1.off();
    canvas.off();
  });

  it('group mouseenter, mouseover', () => {
    let group1EnterCalled = false;
    let group1OverCalled = false;
    let group11EnterCalled = false;
    let group11OverCalled = false;
    let canvasEnterCalled = false;

    canvas.on('mouseenter', () => {
      canvasEnterCalled = true;
    });
    group1.on('mouseenter', () => {
      group1EnterCalled = true;
    });
    group1.on('mouseover', () => {
      group1OverCalled = true;
    });

    group11.on('mouseenter', () => {
      group11EnterCalled = true;
    });

    group11.on('mouseover', () => {
      group11OverCalled = true;
    });

    let enterCalled = false;
    shape4.on('mouseenter', () => {
      enterCalled = true;
    });

    const { clientX, clientY } = getClientPoint(200, 200);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    expect(enterCalled).eql(true);
    expect(canvasEnterCalled).eql(false);
    expect(group1EnterCalled).eql(true);
    expect(group1OverCalled).eql(true);
    expect(group11EnterCalled).eql(true);
    expect(group11OverCalled).eql(true);

    // 重置，进入同个 group 下的图形
    group1EnterCalled = false;
    group1OverCalled = false;
    group11EnterCalled = false;
    group11OverCalled = false;
    canvasEnterCalled = false;
    enterCalled = false;

    shape5.on('mouseenter', () => {
      enterCalled = true;
    });

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });

    expect(enterCalled).eql(true);
    expect(canvasEnterCalled).eql(false);
    expect(group1EnterCalled).eql(false);
    expect(group1OverCalled).eql(true);
    expect(group11EnterCalled).eql(false);
    expect(group11OverCalled).eql(true);

    // 重置，进入另一个同个 group 下的图形
    group1EnterCalled = false;
    group1OverCalled = false;
    group11EnterCalled = false;
    group11OverCalled = false;
    canvasEnterCalled = false;
    enterCalled = false;

    shape6.on('mouseenter', () => {
      enterCalled = true;
    });
    let group12EnterCalled = false;
    group12.on('mouseenter', () => {
      group12EnterCalled = true;
    });

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 20,
      clientY: clientY + 20,
    });

    expect(enterCalled).eql(true);
    expect(canvasEnterCalled).eql(false);
    expect(group1EnterCalled).eql(false);
    expect(group1OverCalled).eql(true);
    expect(group11EnterCalled).eql(false);
    expect(group11OverCalled).eql(false);
    expect(group12EnterCalled).eql(true);
    canvas.off();
    group1.off();
    group11.off();
    group12.off();
    shape4.off();
    shape5.off();
    shape6.off();
  });

  it('mouseleave, mouseout', () => {
    // 回滚到画布起始坐标，开始 leave 和 out 的测试
    const { clientX, clientY } = getClientPoint(0, 0);
    // 移动到第一个图形
    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });

    let canvasLeaveCalled = false;
    canvas.on('mouseleave', () => {
      canvasLeaveCalled = true;
    });

    let canvasOutCalled = false;
    canvas.on('mouseout', () => {
      canvasOutCalled = true;
    });

    let leaveCalled = false;
    let fromShape;
    let toShape;
    shape1.on('mouseleave', (ev) => {
      leaveCalled = true;
      fromShape = ev.fromShape;
      toShape = ev.toShape;
    });
    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 20,
      clientY: clientY + 10,
    });

    expect(leaveCalled).eql(true);
    expect(canvasLeaveCalled).eql(false);
    expect(canvasOutCalled).eql(true);
    expect(fromShape).eql(shape1);
    expect(toShape).eql(shape2);
    shape1.off();
    canvas.off();
  });

  it('group mouseleave, mouseout', (done) => {
    const { clientX, clientY } = getClientPoint(200, 200);
    setTimeout(() => {
      // 进入 shape4
      simulateMouseEvent(element, 'mousemove', {
        clientX,
        clientY,
      });

      let group1LeaveCalled = false;
      let group1OutCalled = false;
      let group11LeaveCalled = false;
      let group11OutCalled = false;
      let canvasLeaveCalled = false;
      let canvasOutCalled = false;

      canvas.on('mouseleave', () => {
        canvasLeaveCalled = true;
      });

      canvas.on('mouseout', () => {
        canvasOutCalled = true;
      });
      group1.on('mouseleave', () => {
        group1LeaveCalled = true;
      });
      group1.on('mouseout', () => {
        group1OutCalled = true;
      });

      group11.on('mouseleave', () => {
        group11LeaveCalled = true;
      });

      group11.on('mouseout', () => {
        group11OutCalled = true;
      });

      let outCalled = false;
      shape4.on('mouseleave', () => {
        outCalled = true;
      });
      // 移动到 shape5
      simulateMouseEvent(element, 'mousemove', {
        clientX: clientX + 10,
        clientY: clientY + 10,
      });
      expect(outCalled).eql(true);
      expect(group1LeaveCalled).eql(false);
      expect(group11LeaveCalled).eql(false);
      expect(group1OutCalled).eql(true);
      expect(group11OutCalled).eql(true);
      expect(canvasLeaveCalled).eql(false);
      expect(canvasOutCalled).eql(true);

      group1LeaveCalled = false;
      group1OutCalled = false;
      group11LeaveCalled = false;
      group11OutCalled = false;
      canvasLeaveCalled = false;
      canvasOutCalled = false;
      // 移动到 shape6
      simulateMouseEvent(element, 'mousemove', {
        clientX: clientX + 20,
        clientY: clientY + 20,
      });

      expect(group1LeaveCalled).eql(false);
      expect(group11LeaveCalled).eql(true);
      expect(group1OutCalled).eql(true);
      expect(group11OutCalled).eql(true);
      expect(canvasLeaveCalled).eql(false);
      expect(canvasOutCalled).eql(true);

      canvas.off();
      group1.off();
      group11.off();
      shape4.off();
      done();
    }, 10);
  });

  it('drag', () => {
    let startshape = null;
    let dragshape = null;
    let endshape = null;
    shape1.on('dragstart', (ev) => {
      startshape = ev.shape;
    });

    shape1.on('drag', (ev) => {
      dragshape = ev.shape;
    });

    shape1.on('dragend', (ev) => {
      endshape = ev.shape;
    });

    shape1.set('draggable', true);
    const { clientX, clientY } = getClientPoint(10, 10);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });

    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(startshape).eql(null);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 10,
      clientY,
    });

    expect(startshape).eql(shape1);
    expect(shape1.get('capture')).eql(false);
    expect(dragshape).eql(null);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 20,
      clientY,
    });

    expect(dragshape).eql(shape1);

    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });

    expect(endshape).eql(shape1);
    expect(shape1.get('capture')).eql(true);
    shape1.set('draggable', false);
    shape1.off();
  });

  it('dragover, dragenter, dragleave, drop', () => {
    shape4.set('draggable', true);
    let enterCalled = false;
    let overCalled = false;
    let leaveCalled = false;
    let dropCalled = false;

    shape5.on('dragenter', () => {
      enterCalled = true;
    });

    shape5.on('dragover', () => {
      overCalled = true;
    });

    shape5.on('dragleave', () => {
      leaveCalled = true;
    });

    shape6.on('drop', () => {
      dropCalled = true;
    });

    // 移动到 shape4
    const { clientX, clientY } = getClientPoint(200, 200);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    // 按下鼠标
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });

    // 移动几像素，开始拖动
    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 10,
      clientY,
    });
    expect(enterCalled).eql(false);
    // 继续移动 shape5
    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });
    expect(enterCalled).eql(true);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 12,
      clientY: clientY + 12,
    });
    expect(overCalled).eql(true);
    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 20,
      clientY: clientY + 20,
    });
    expect(leaveCalled).eql(true);

    simulateMouseEvent(element, 'mouseup', {
      clientX: clientX + 20,
      clientY: clientY + 20,
    });
    expect(dropCalled).eql(true);

    shape4.set('draggable', false);
    shape5.off();
    shape6.off();
  });

  it('bubble click', () => {
    let group1Called = false;
    let group11Called = false;
    let canvasCalled = false;
    let clickCalled = false;
    shape4.on('click', () => {
      clickCalled = true;
    });
    shape6.on('click', () => {
      clickCalled = true;
    });
    group1.on('click', () => {
      group1Called = true;
    });

    group11.on('click', () => {
      group11Called = true;
    });

    canvas.on('click', () => {
      canvasCalled = true;
    });

    // 移动到 shape4
    const { clientX, clientY } = getClientPoint(200, 200);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    // 按下鼠标
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    // 不在一个图形上抬起
    simulateMouseEvent(element, 'mouseup', {
      clientX: clientX + 20,
      clientY: clientY + 20,
    });
    expect(clickCalled).eql(false);

    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    // 按下鼠标
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });

    // 抬起鼠标
    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });

    expect(clickCalled).eql(true);
    expect(group1Called).eql(true);
    expect(group11Called).eql(true);
    expect(canvasCalled).eql(true);
    canvas.off();
    group1.off();
    shape4.off();
    shape6.off();
    group11.off();
  });

  it('delegation click', () => {
    group1.set('name', 'custom');
    let shape;
    let current;
    let delegate;
    canvas.on('custom:click', (ev) => {
      shape = ev.shape;
      current = ev.currentTarget;
      delegate = ev.delegateTarget;
    });

    const { clientX, clientY } = getClientPoint(200, 200);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    // 按下鼠标
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });

    // 抬起鼠标
    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });

    expect(shape).eql(shape4);
    expect(current).eql(group1);
    expect(delegate).eql(canvas);
    canvas.off();
    group1.set('name', null);
  });

  it('stopPropagation', () => {
    let group1Called = false;
    let group11Called = false;
    let canvasCalled = false;
    let clickCalled = false;
    let delegateCalled = false;
    shape4.on('click', () => {
      clickCalled = true;
    });
    // 阻止向上传输
    group11.on('click', (ev) => {
      group11Called = true;
      ev.stopPropagation();
    });

    group1.on('click', () => {
      group1Called = true;
    });

    canvas.on('click', () => {
      canvasCalled = true;
    });
    let current;
    group1.set('name', 'my-name');
    canvas.on('my-name:click', (ev) => {
      current = ev.currentTarget;
      delegateCalled = true;
    });

    // 移动到 shape4
    const { clientX, clientY } = getClientPoint(200, 200);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });
    // 按下鼠标
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });

    // 抬起鼠标
    simulateMouseEvent(element, 'mouseup', {
      clientX,
      clientY,
    });

    expect(clickCalled).eql(true);
    expect(group11Called).eql(true);

    expect(group1Called).eql(false);
    expect(canvasCalled).eql(false);
    expect(delegateCalled).eql(true);
    expect(current).eql(group1);
    canvas.off();
    group1.off();
    shape4.off();
    group11.off();
  });

  it('canvas mouseover, mouseout', () => {
    let enterCalled = false;
    let enterShape = null;
    canvas.on('mouseover', (ev) => {
      enterCalled = true;
      enterShape = ev.shape;
    });
    let leaveCalled = false;
    canvas.on('mouseout', () => {
      leaveCalled = true;
    });
    let shapeLeaveCalled = false;
    shape1.on('mouseout', () => {
      shapeLeaveCalled = true;
    });

    // 移动到画布外面
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(document.body, 'mousemove', {
      clientX,
      clientY: clientY - 10,
    });

    simulateMouseEvent(element, 'mouseover', {
      clientX,
      clientY,
    });

    expect(enterCalled).eql(true);
    simulateMouseEvent(element, 'mouseover', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });

    expect(enterShape).eql(shape1);

    simulateMouseEvent(element, 'mouseout', {
      clientX: clientX - 1,
      clientY: clientY - 1,
    });
    expect(leaveCalled).eql(true);
    expect(shapeLeaveCalled).eql(true);
    canvas.off();
  });

  it('canvas mouseenter, mouseleave', () => {
    let enterCalled = false;
    let enterShape = null;
    let enterShapeCalled = false;

    shape1.on('mouseenter', () => {
      enterShapeCalled = true;
    });

    canvas.on('mouseenter', (ev) => {
      enterCalled = true;
      enterShape = ev.toShape;
    });

    let leaveCalled = false;
    let leaveShape = null;
    canvas.on('mouseleave', (ev) => {
      leaveCalled = true;
      leaveShape = ev.fromShape;
    });

    // 移动到画布外面
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(document.body, 'mousemove', {
      clientX,
      clientY: clientY - 10,
    });

    simulateMouseEvent(element, 'mouseenter', {
      clientX,
      clientY,
    });

    expect(enterCalled).eql(true);
    simulateMouseEvent(element, 'mouseenter', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });

    expect(enterShape).eql(shape1);
    expect(enterShapeCalled).eql(true);
    simulateMouseEvent(element, 'mouseleave', {
      clientX: clientX - 1,
      clientY: clientY - 1,
    });
    expect(leaveCalled).eql(true);
    expect(leaveShape).eql(shape1);

    simulateMouseEvent(element, 'mousemove', {
      clientX: clientX + 200,
      clientY: clientY + 200,
    });

    simulateMouseEvent(element, 'mouseleave', {
      clientX: clientX + 501,
      clientY: clientY + 501,
    });

    expect(leaveShape).eql(shape4);
    canvas.off();
    shape1.off();
  });

  it('canvas dragenter, dragleave', () => {
    let enterCalled = false;
    let enterShape = null;
    canvas.on('dragenter', (ev) => {
      enterCalled = true;
      enterShape = ev.toShape;
    });
    let leaveCalled = false;
    canvas.on('dragleave', () => {
      leaveCalled = true;
    });

    // 移动到画布外面
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(document.body, 'mousemove', {
      clientX,
      clientY: clientY - 10,
    });

    simulateMouseEvent(element, 'dragenter', {
      clientX,
      clientY,
    });

    expect(enterCalled).eql(true);
    expect(enterShape).eql(null);
    simulateMouseEvent(element, 'dragenter', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });
    expect(enterShape).eql(shape1);

    simulateMouseEvent(element, 'dragleave', {
      clientX: clientX + 501,
      clientY: clientY + 10,
    });

    expect(leaveCalled).eql(true);
    canvas.off();
  });

  it('canvas dragover', () => {
    let enterCalled = false;
    let enterShape = null;
    shape1.on('dragenter', (ev) => {
      enterCalled = true;
      enterShape = ev.shape;
    });
    let overShape = null;
    canvas.on('dragover', (ev) => {
      overShape = ev.shape;
    });

    // 移动到画布边缘
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(element, 'mousemove', {
      clientX,
      clientY,
    });

    simulateMouseEvent(element, 'dragover', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });

    expect(enterCalled).eql(true);
    expect(enterShape).eql(shape1);
    expect(overShape).eql(shape1);
    canvas.off();
  });

  it('canvas drop', () => {
    let dropCalled = false;
    let dropShape = null;
    canvas.on('drop', (ev) => {
      dropCalled = true;
      dropShape = ev.shape;
    });
    // 移动到画布外面
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(element, 'drop', {
      clientX: clientX + 10,
      clientY: clientY + 10,
    });
    expect(dropCalled).eql(true);
    expect(dropShape).eql(shape1);
  });

  it('destroy', () => {
    controller.destroy();
    expect(controller.canvas).eql(null);
    expect(controller.draggingShape).eql(null);
    let called = false;
    canvas.on('mousedown', () => {
      called = true;
    });
    // 判断事件已经被移除
    const { clientX, clientY } = getClientPoint(0, 0);
    simulateMouseEvent(element, 'mousedown', {
      clientX,
      clientY,
    });
    expect(called).eql(false);
  });
});

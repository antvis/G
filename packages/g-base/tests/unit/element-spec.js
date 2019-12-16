const expect = require('chai').expect;
import Canvas from '../../src/abstract/canvas';
import Group from '../../src/abstract/group';
import Element from '../../src/abstract/element';
import GraphEvent from '../../src/event/graph-event';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

class MyElement extends Element {
  getBBox() {
    const { x, y, width, height } = this.attrs;
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
  getShapeBase() {
    return MyElement;
  }
  getGroupBase() {
    return Group;
  }
}

class MyCircle extends Element {
  getBBox() {
    const { x, y, r } = this.attrs;
    return {
      minX: x - r,
      minY: y - r,
      maxX: x + r,
      maxY: y + r,
    };
  }
}

MyElement.Circle = MyCircle;

class MyCanvas extends Canvas {
  createDom() {
    const el = document.createElement('canvas');
    return el;
  }
  getShapeBase() {
    return MyElement;
  }
  getGroupBase() {
    return Group;
  }
}

describe('test element', () => {
  const canvas = new MyCanvas({
    container: dom,
    width: 400,
    height: 400,
  });
  const group = {
    get(name) {
      return this[name];
    },
    getChildren() {
      return this.children;
    },
    children: [],
  };
  const element = new MyElement({
    attrs: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
  });

  it('test init', () => {
    expect(element.attrs.x).eqls(element.get('attrs').x);
  });

  it('attr get', () => {
    expect(element.attr()).eqls(element.attrs);
    expect(element.attr('x')).eqls(0);
    expect(element.attr('height')).eqls(100);
  });

  it('attr set', () => {
    element.attr('x', 50);
    element.attr('y', 50);
    expect(element.attr('x')).eqls(50);
    expect(element.attr('y')).eqls(50);
  });

  it('attr set object', () => {
    element.attr({ width: 50, height: 50 });
    expect(element.attr('width')).eqls(50);
    expect(element.attr('height')).eqls(50);
  });

  it('getBBox', () => {
    const bbox = element.getBBox();
    expect(bbox.minX).equal(50);
    expect(bbox.minY).equal(50);
    expect(bbox.maxX).equal(100);
    expect(bbox.maxY).equal(100);
  });

  it('to front', () => {
    group.children.push(element);
    element.set('parent', group);
    const e1 = new MyElement({
      parent: group,
    });
    const e2 = new MyElement({
      parent: group,
    });
    group.children.push(e1);
    group.children.push(e2);
    expect(group.children.indexOf(element)).eqls(0);
    element.toFront();
    expect(group.children.indexOf(element)).eqls(2);
  });

  it('to back', () => {
    element.toBack();
    expect(group.children.indexOf(element)).eqls(0);
  });

  it('remove', () => {
    const e1 = group.children[1];
    // 移除而不销毁
    e1.remove(false);
    expect(group.children.indexOf(e1)).eqls(-1);
    expect(e1.destroyed).eqls(false);
    const e2 = group.children[1];
    e2.remove();
    expect(e2.destroyed).eqls(true);
  });

  it('show, hide', () => {
    expect(element.get('visible')).eqls(true);
    element.hide();
    expect(element.get('visible')).eqls(false);
    element.show();
    expect(element.get('visible')).eqls(true);
  });

  it('matrix', () => {
    const originMatix = null;
    expect(element.attr('matrix')).eqls(originMatix);
    const toMatrx = [2, 0, 0, 0, 1, 0, 0, 0, 1];
    element.setMatrix(toMatrx);
    expect(element.attr('matrix')).eqls(toMatrx);
    element.resetMatrix();
    expect(element.attr('matrix')).eqls(originMatix);
  });

  it('clip', () => {
    element.set('canvas', canvas);
    expect(element.getClip()).eqls(null);
    element.setClip({
      type: 'circle',
      attrs: {
        x: 10,
        y: 10,
        r: 10,
      },
    });
    const clipShape = element.getClip();
    expect(clipShape.get('type')).eqls('circle');
    expect(clipShape.getBBox()).eqls({
      minX: 0,
      minY: 0,
      maxX: 20,
      maxY: 20,
    });

    element.setClip(null);
    expect(clipShape.destroyed).eqls(true);
    expect(element.getClip()).eqls(null);
  });

  it('destroy', () => {
    element.destroy();
    expect(element.destroyed).eqls(true);
    expect(element.attrs).eqls({});
  });

  it('element.emitDelegation should work', () => {
    const canvas = new MyCanvas({
      container: dom,
      width: 400,
      height: 400,
    });
    const group = new Group({
      getShapeBase() {
        return MyElement;
      },
      getGroupBase() {
        return Group;
      },
    });
    const element = new MyElement({
      name: 'element',
      attrs: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    group.add(element);
    canvas.add(group);
    let groupClick = false;
    let elementClick = false;
    canvas.on('group:click', () => {
      groupClick = true;
    });
    canvas.on('element:click', () => {
      elementClick = true;
    });
    // 新建事件对象
    const eventObj = new GraphEvent('click', {});
    // 设置委托路径
    eventObj.propagationPath = [element, group];
    // 触发委托事件
    canvas.emitDelegation('click', eventObj);
    // 异步断言
    setTimeout(() => {
      expect(groupClick).eqls(true);
      expect(elementClick).eqls(true);
    }, 20);
  });
});

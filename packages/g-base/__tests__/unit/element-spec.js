const expect = require('chai').expect;
import Element from '../../src/abstract/element';

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

const canvas = {
  getShapeBase() {
    return MyElement;
  },
};

describe('test element', () => {
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
});

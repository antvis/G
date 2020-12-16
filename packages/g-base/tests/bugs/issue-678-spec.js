// @ts-nocheck
import { expect } from 'chai';
import Canvas from '../../src/abstract/canvas';
import Group from '../../src/abstract/group';
import Element from '../../src/abstract/element';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

class MyElement extends Element {
  getBBox() {
    return {};
  }
  getShapeBase() {
    return MyElement;
  }
  getGroupBase() {
    return Group;
  }
}

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

describe('#678', () => {
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
    attrs: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
  });

  it('init', () => {
    element.set('canvas', canvas);
    expect(element).to.exist;
    expect(element.get('canvas')).to.exist;

    group.add(element);
    canvas.add(group);
  });

  it('animate normal', () => {
    element.animate();
  });

  it('destroy group, and element animate not work', () => {
    group.destroy();
    element.animate();
    expect(element.destroyed).eqls(true);
    expect(element.get('canvas')).eqls(undefined);
  });
});

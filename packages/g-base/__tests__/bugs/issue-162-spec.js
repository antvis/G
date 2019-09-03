const expect = require('chai').expect;
import Canvas from '../../src/abstract/canvas';
import Group from '../../src/abstract/group';
import Element from '../../src/abstract/element';

class MyCanvas extends Canvas {
  createDom() {
    const el = document.createElement('canvas');
    return el;
  }
}

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#162', () => {
  it('should set canvas for element recursively', () => {
    const canvas = new MyCanvas({
      container: dom,
      width: 400,
      height: 400,
    });
    const group = new Group({});
    const element1 = new Element({});
    const element2 = new Element({});
    const subGroup = new Group({});
    const subElement1 = new Element({});
    const subElement2 = new Element({});
    subGroup.add(subElement1);
    subGroup.add(subElement2);
    group.add(element1);
    group.add(element2);
    group.add(subGroup);
    expect(element1.get('canvas')).equal(undefined);
    expect(element2.get('canvas')).equal(undefined);
    expect(subGroup.get('canvas')).equal(undefined);
    expect(subElement1.get('canvas')).equal(undefined);
    expect(subElement2.get('canvas')).equal(undefined);
    canvas.add(group);
    expect(element1.get('canvas')).equal(canvas);
    expect(element2.get('canvas')).equal(canvas);
    expect(subGroup.get('canvas')).equal(canvas);
    expect(subElement1.get('canvas')).equal(canvas);
    expect(subElement2.get('canvas')).equal(canvas);
  });
});

const expect = require('chai').expect;
import ContainerUtil from '../../src/util/container';

// 模拟上下文，进行测试

class Base {
  visible = true;
  capture = true;

  get(name) {
    return this[name];
  }
  set(name, value) {
    this[name] = value;
  }

  getParent() {
    return this.get('parent');
  }

  getCanvas() {
    return this.get('canvas');
  }

  remove() {
    this.parent = null;
    this.canvase = null;
  }

  isHit() {
    return false;
  }

  destroy() {
    this.remove();
    this.destroyed = true;
  }
}
class Item extends Base {
  isGroup() {
    return false;
  }
  constructor(cfg) {
    super();
    Object.assign(this, cfg);
  }

}

Item.Circle = Item;

class Group extends Base {

  isGroup() {
    return true;
  }
  getShapeBase() {
    return Item;
  }

  getGroupBase() {
    return Group;
  }

  constructor(cfg) {
    super();
    Object.assign(this, cfg);
    this.children = [];
  }

  getChildren() {
    return this.get('children');
  }
}

class SubGroup extends Group {
  isSub = true;
}

describe('test container util', () => {
  const canvas = new Group({
    isCanvas() {
      return true;
    }
  });

  const group = new Group({
    isCanvas() {
      return false;
    },
    canvas
  });


  it('add', () => {
    const item = new Item();
    ContainerUtil.add(group, item);
    expect(group.getChildren().length).equal(1);
    expect(item.getParent()).eqls(group);
    expect(item.getCanvas()).eqls(canvas);
  });

  it('add shape', () => {
    const item = ContainerUtil.addShape(group, 'circle', {
      attrs: {}
    });
    expect(item.getParent()).eqls(group);
    expect(item.getCanvas()).eqls(canvas);
    expect(item.get('type')).eqls('circle');
    expect(group.getChildren().length).eqls(2);
  });

  it('add group', () => {
    const newGroup = ContainerUtil.addGroup(group);
    expect(group.getChildren().length).eqls(3);
    expect(newGroup.getParent()).eqls(group);

    const ng2 = ContainerUtil.addGroup(group, SubGroup);
    expect(ng2.isSub).eqls(true);

    const ng3 = ContainerUtil.addGroup(group, { a: 'a1' });
    expect(ng3.get('a')).eqls('a1');

  });

  it('contains', () => {
    expect(ContainerUtil.contains(group, group.getChildren()[0])).equal(true);
    expect(ContainerUtil.contains(group, {})).equal(false);
  });

  it('remove', () => {
    const item = group.getChildren()[0];
    ContainerUtil.removeChild(group, item);
    expect(item.getParent()).equal(null);
    expect(group.getChildren()[0]).not.eqls(item);
  });

  it('clear', () => {
    const item = group.getChildren()[0];
    ContainerUtil.clear(group);
    expect(group.getChildren().length).eqls(0);
    expect(item.destroyed).eqls(true);
  });

  it('sort', () => {
    ContainerUtil.addShape(group, 'circle', {
      attrs: {},
      zIndex: 1
    });
    ContainerUtil.addShape(group, 'circle', {
      attrs: {},
      zIndex: 0
    });
    expect(group.getChildren()[0].get('zIndex')).equal(1);
    ContainerUtil.sort(group);
    expect(group.getChildren()[0].get('zIndex')).equal(0);
  });

  it('getShape', () => {
    expect(ContainerUtil.getShape(group, 0, 0)).equal(null);
    const item = ContainerUtil.addShape(group, 'circle', {
      isHit() {
        return true;
      }
    });
    expect(ContainerUtil.getShape(group, 0, 0)).equal(item);
  });

  it('deep getShape', () => {
    ContainerUtil.clear(group);
    ContainerUtil.addShape(group, 'circle', {
      attrs: {}
    });
    expect(ContainerUtil.getShape(group, 0, 0)).equal(null);
    const subGroup = ContainerUtil.addGroup(group, {
      isCanvas() {
        return false;
      }
    });
    const item = ContainerUtil.addShape(subGroup, 'circle', {
      isHit() {
        return true;
      }
    });
    expect(ContainerUtil.getShape(group, 0, 0)).equal(item);
    group.set('capture', false); // 不支持拾取
    expect(ContainerUtil.getShape(group, 0, 0)).equal(null);
  });

});

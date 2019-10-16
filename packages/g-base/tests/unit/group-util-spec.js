const expect = require('chai').expect;
import GroupUtil from '../../src/util/group';
class Item {
  isGroup() {
    return false;
  }
  constructor(cfg) {
    Object.assign(this, cfg);
  }
  get(name) {
    return this[name];
  }
}

class Group {
  isGroup() {
    return true;
  }
  constructor(cfg) {
    Object.assign(this, cfg);
  }

  invertFromMatrix() {}
  get(name) {
    return this[name];
  }

  getChildren() {
    return this.children;
  }
}
const group = new Group({
  children: [
    new Item({ id: '01', text: '01' }),
    new Item({ id: '02', text: '02' }),
    new Group({
      children: [new Item({ id: '04', text: '04' }), new Item({ id: 'test', text: '02' })],
    }),
    new Item({ id: '03', text: '03' }),
  ],
});

describe('test group util', () => {
  it('getFirst', () => {
    expect(GroupUtil.getFirst(group).id).eqls('01');
  });

  it('getLast', () => {
    expect(GroupUtil.getLast(group).id).eqls('03');
  });

  it('getCount', () => {
    expect(GroupUtil.getCount(group)).eqls(group.children.length);
  });

  it('findAll', () => {
    expect(
      GroupUtil.findAll(group, function(item) {
        return item.text === '02';
      }).length
    ).eqls(2);

    expect(
      GroupUtil.findAll(group, function(item) {
        return item.text === '05';
      }).length
    ).eqls(0);
  });

  it('findById', () => {
    expect(GroupUtil.findById(group, '01')).not.eqls(null);
    expect(GroupUtil.findById(group, '05')).eqls(null);
    expect(GroupUtil.findById(group, '04')).not.eqls(null);
  });

  it('find', () => {
    expect(
      GroupUtil.find(group, (item) => {
        return item.text === '02';
      }).id
    ).eqls('02');
    expect(
      GroupUtil.find(group, function(item) {
        return item.text === '05';
      })
    ).eqls(null);
  });
});

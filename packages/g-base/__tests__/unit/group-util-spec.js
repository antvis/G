const expect = require('chai').expect;
import GroupUtil from '../../src/util/group';
const group = {
  children: [ { id: '01', text: '01' }, { id: '02', text: '02' }, { id: '03', text: '03' } ],
  getChildren() {
    return this.children;
  }
};

describe('test group util', () => {
  it('getFirst', () => {
    expect(GroupUtil.getFirst(group).id).eqls('01');
  });

  it('getLast', () => {
    expect(GroupUtil.getLast(group).id).eqls('03');
  });
});

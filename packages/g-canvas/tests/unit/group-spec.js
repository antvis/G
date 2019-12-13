import { expect } from 'chai';
import Shape from '../../../src/shape';
import Group from '../../../src/group';

describe('Canvas Group', () => {
  it('getShapeBase', () => {
    const base = new Group({});
    expect(base.getShapeBase()).eqls(Shape);
  });

  it('getGroupBase', () => {
    const base = new Group({});
    expect(base.getGroupBase()).eqls(Group);
  });
});

import { expect } from 'chai';
import * as Shape from '../../../src/shape';
import Base from '../../../src/shape/base';
import Group from '../../../src/group';

describe('Canvas Shape Base', () => {
  it('getShapeBase', () => {
    const base = new Base({});
    expect(base.getShapeBase()).eqls(Shape);
  });

  it('getGroupBase', () => {
    const base = new Base({});
    expect(base.getGroupBase()).eqls(Group);
  });
});

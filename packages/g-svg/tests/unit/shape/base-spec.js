import { expect } from 'chai';
import Group from '../../../src/group';
import * as Shape from '../../../src/shape';
import Base from '../../../src/shape/base';

describe('SVG Shape Base', () => {
  it('getShapeBase', () => {
    const base = new Base({});
    expect(base.getShapeBase()).eqls(Shape);
  });

  it('getGroupBase', () => {
    const base = new Base({});
    expect(base.getGroupBase()).eqls(Group);
  });
});

import { expect } from 'chai';
import { Interfaces, Types, BBox, AbstractCanvas, AbstractGroup, AbstractShape, Base, version } from '../../src/index';

describe('Canvas index', () => {
  it('Interfaces', () => {
    expect(Interfaces).not.eql(undefined);
  });

  it('Types', () => {
    expect(Types).not.eql(undefined);
  });

  it('BBox', () => {
    expect(BBox).not.eql(undefined);
  });

  it('Canvas', () => {
    expect(AbstractCanvas).not.eql(undefined);
  });

  it('Group', () => {
    expect(AbstractGroup).not.eql(undefined);
  });

  it('Shape', () => {
    expect(AbstractShape).not.eql(undefined);
  });

  it('Base', () => {
    expect(Base).not.eql(undefined);
  });

  it('version', () => {
    const pkg = require('../../package.json');
    expect(version).eql(pkg.version);
  });
});

import { expect } from 'chai';
import {
  BBox,
  Event,
  Base,
  AbstractCanvas,
  AbstractGroup,
  AbstractShape,
  AbstractElement,
  AbstractElement2D,
  AbstractElement3D,
  version,
} from '../../src/index';

describe('Canvas index', () => {
  it('BBox', () => {
    expect(BBox).not.eql(undefined);
  });

  it('Event', () => {
    expect(Event).not.eql(undefined);
  });

  it('Base', () => {
    expect(Base).not.eql(undefined);
  });

  it('AbstractCanvas', () => {
    expect(AbstractCanvas).not.eql(undefined);
  });

  it('AbstractGroup', () => {
    expect(AbstractGroup).not.eql(undefined);
  });

  it('AbstractShape', () => {
    expect(AbstractShape).not.eql(undefined);
  });

  it('AbstractElement', () => {
    expect(AbstractElement).not.eql(undefined);
  });

  it('AbstractElement2D', () => {
    expect(AbstractElement2D).not.eql(undefined);
  });

  it('AbstractElement3D', () => {
    expect(AbstractElement3D).not.eql(undefined);
  });

  it('version', () => {
    const pkg = require('../../package.json');
    expect(version).eql(pkg.version);
  });
});

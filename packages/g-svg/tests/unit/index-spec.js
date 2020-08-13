import { expect } from 'chai';
import { Event, Canvas, Group, Shape, version } from '../../src/index';
import { version as PkgVersion } from '../../package.json';

describe('Canvas index', () => {
  it('Event', () => {
    expect(Event).not.eql(undefined);
  });

  it('Canvas', () => {
    expect(Canvas).not.eql(undefined);
  });

  it('Group', () => {
    expect(Group).not.eql(undefined);
  });

  it('Shape', () => {
    expect(Shape).not.eql(undefined);
  });

  it('version', () => {
    expect(version).eql(PkgVersion);
  });
});

import { expect } from 'chai';
import * as G from '../../src/index';

describe('Canvas index', () => {
  it('Canvas', () => {
    expect(G.Interfaces).not.eql(undefined);
  });

  it('Types', () => {
    expect(G.Types).not.eql(undefined);
  });

  it('Canvas', () => {
    expect(G.Canvas).not.eql(undefined);
  });

  it('Group', () => {
    expect(G.Group).not.eql(undefined);
  });

  it('Shape', () => {
    expect(G.Shape).not.eql(undefined);
  });

  it('version', () => {
    const pkg = require('../../package.json');
    expect(G.version).eql(pkg.version);
  });
});

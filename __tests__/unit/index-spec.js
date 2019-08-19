import { expect } from 'chai';
import * as G from '../../src/index';
const pkg = require('../../package.json');

describe('index', () => {
  it('G', () => {
    expect('G').to.be.a('string');
    expect(G.version).to.equal(pkg.version);
  });
});

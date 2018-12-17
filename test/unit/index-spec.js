const expect = require('chai').expect;
const G = require('../../src/index');
const pkg = require('../../package.json');

describe('index', () => {
  it('G', () => {
    expect('G').to.be.a('string');
    expect(G.version).to.equal(pkg.version);
  });
  it('EventEmitter', () => {
    expect(G.EventEmitter).not.to.be.undefined;
  });
});

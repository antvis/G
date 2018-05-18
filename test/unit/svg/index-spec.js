const expect = require('chai').expect;
const G = require('../../../src/svg/index');

describe('index', () => {
  it('G', () => {
    expect('G').to.be.a('string');
    expect(G).to.be.a('object');
  });
});

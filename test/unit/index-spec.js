const expect = require('chai').expect;
const isRenderer = require('is-electron-renderer');
const G = require('../../index');

describe('index', () => {
  it('G', () => {
    expect('G').to.be.a('string');
    expect(G).to.be.a('object');
  });
});

after(() => {
  if (isRenderer && window.__coverage__) {
    const { remote } = require('electron');
    const fs = remote.require('fs');
    const path = remote.require('path');
    fs.writeFileSync(path.resolve(process.cwd(), './test/coverage/coverage.json'), JSON.stringify(window.__coverage__));
  }
});

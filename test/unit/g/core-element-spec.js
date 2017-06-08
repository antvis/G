const expect = require('chai').expect;
const Element = require('../../../src/g/core/element');
const Matrix = require('@ali/g-matrix');
const Matrix3 = Matrix.Matrix3;

describe('Element', function() {
  it('constructor', function() {
    const e = new Element({
      id: 'aaa',
      attrs: {
        width: 20,
        height: 30,
        stroke: '#231'
      }
    });

    expect(e.__cfg).not.to.be.undefined;
    expect(e.__cfg.id).to.equal('aaa');
    expect(e.__attrs).not.to.be.undefined;
    expect(e.__attrs.width).to.equal(20);
    expect(e.__attrs.height).to.equal(30);
    expect(e.__m).not.to.be.undefined;
    const m = new Matrix3();
    expect(e.__m.equal(m)).to.be.true;
    // expect(e.__listeners).not.to.be.undefined;
  });

  it('set and get', function() {
    const e = new Element();
    let a = 123;
    expect(a).to.equal(123);
    e.__setTest = function(v) {
      a = 321;
      return v - 1;
    };
    e.set('test', 1111);
    expect(e.get('test')).to.equal(1110);
    expect(a).to.equal(321);
  });
});

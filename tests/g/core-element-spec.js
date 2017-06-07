var expect = require('@ali/expect.js');
var Element = require('../../src/g/core/element');
var Matrix = require('@ali/g-matrix');
var Matrix3 = Matrix.Matrix3;

describe('Element', function() {
  it('constructor', function() {
    var e = new Element({
      id: 'aaa',
      attrs: {
        width: 20,
        height: 30,
        stroke: '#231'
      }
    });

    expect(e.__cfg).not.to.be(undefined);
    expect(e.__cfg.id).to.be('aaa');
    expect(e.__attrs).not.to.be(undefined);
    expect(e.__attrs['width']).to.be(20);
    expect(e.__attrs['height']).to.be(30);
    expect(e.__m).not.to.be(undefined);
    var m = new Matrix3();
    expect(e.__m.equal(m)).to.be(true);
    // expect(e.__listeners).not.to.be(undefined);
  });

  it('set and get', function() {
    var e = new Element();
    var a = 123;
    expect(a).to.be(123);
    e.__setTest = function(v) {
      a = 321;
      return v - 1;
    };
    e.set('test', 1111);
    expect(e.get('test')).to.be(1110);
    expect(a).to.be(321);
  });
});

var expect = require('@ali/expect.js');
var Element = require('../../src/g/core/element');
var Matrix = require('@ali/g-matrix');
var Vector3 = Matrix.Vector3;
var Matrix3 = Matrix.Matrix3;
var gMath = require('@ali/g-math');

describe('Transform', function() {

  it('translate and apply', function() {
    var e = new Element();
    var point = new Vector3(0, 0, 1);
    e.translate(10, 4);
    e.apply(point);
    expect(gMath.equal(point.x, 10)).to.be(true);
    expect(gMath.equal(point.y, 4)).to.be(true);
  });

  it('rotate', function() {
    var e = new Element();
    var point = new Vector3(10, 0, 0);
    e.rotate(45 / 180 * Math.PI);
    e.apply(point);
    expect(gMath.equal(point.x, 5 * Math.sqrt(2))).to.be(true);
    expect(gMath.equal(point.y, 5 * Math.sqrt(2))).to.be(true);
    e.apply(point);
    expect(gMath.equal(point.x, 0)).to.be(true);
    expect(gMath.equal(point.y, 10)).to.be(true);
    e.rotate(-135 / 180 * Math.PI);
    e.apply(point);
    expect(gMath.equal(point.x, 10)).to.be(true);
    expect(gMath.equal(point.y, 0)).to.be(true);
  });

  it('scale', function() {
    var e = new Element();
    var point = new Vector3(10, 10, 1);
    e.scale(0.5, 0.5);
    e.apply(point);
    expect(gMath.equal(point.x, 5)).to.be(true);
    expect(gMath.equal(point.y, 5)).to.be(true);
    e.scale(4, 2);
    e.apply(point);
    expect(gMath.equal(point.x, 10)).to.be(true);
    expect(gMath.equal(point.y, 5)).to.be(true);
  });

  it('complex', function() {
    var e = new Element();
    var point1 = new Vector3(10, 10, 1);
    var point2 = new Vector3();
    e.translate(10, 10);
    e.rotate(Math.PI / 2);
    e.translate(-10, -10);
    e.scale(0.5, 0.5);
    e.apply(point1);

    expect(gMath.equal(point1.x, -15)).to.be(true);
    expect(gMath.equal(point1.y, 5)).to.be(true);
  });

  it('transform', function() {
    var e = new Element();
    e.transform([['r', Math.PI / 2], ['t', 10, 10], ['r', - Math.PI / 2]]);
    var point = new Vector3(0, 0, 1);
    e.apply(point);
    expect(gMath.equal(point.x, 10)).to.be(true);
    expect(gMath.equal(point.y, -10)).to.be(true);
  });

  it('setTransform and invert', function() {
    var e = new Element();
    e.translate(10, 10);
    e.setTransform([['r', Math.PI / 2], ['t', 10, 10], ['r', -Math.PI / 2], ['s', 0.5, 0.3]]);
    var point = new Vector3(0, 0, 1);
    e.apply(point);
    expect(gMath.equal(point.x, 5)).to.be(true);
    expect(gMath.equal(point.y, -3)).to.be(true);
    e.invert(point);
    expect(gMath.equal(point.x, 0)).to.be(true);
    expect(gMath.equal(point.y, 0)).to.be(true);
    var e1 = new Element();
    e1.setTransform([['m', e.__m]]);
    e1.apply(point);
    expect(gMath.equal(point.x, 5)).to.be(true);
    expect(gMath.equal(point.y, -3)).to.be(true);
    e1.invert(point);
    expect(gMath.equal(point.x, 0)).to.be(true);
    expect(gMath.equal(point.y, 0)).to.be(true);
  });

  it('getMatrix', function() {
    var e = new Element();
    var m = e.getMatrix();
    var m1 = new Matrix3();
    expect(m.equal(m1)).to.be(true);
  });
});










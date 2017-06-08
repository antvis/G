const expect = require('chai').expect;
const Element = require('../../../src/g/core/element');
const Util = require('../../../src/util/index');
const Matrix = require('@ali/g-matrix');
const Vector3 = Matrix.Vector3;
const Matrix3 = Matrix.Matrix3;

describe('Transform', function() {

  it('translate and apply', function() {
    const e = new Element();
    const point = new Vector3(0, 0, 1);
    e.translate(10, 4);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 10)).to.be.true;
    expect(Util.isNumberEqual(point.y, 4)).to.be.true;
  });

  it('rotate', function() {
    const e = new Element();
    const point = new Vector3(10, 0, 0);
    e.rotate(45 / 180 * Math.PI);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 5 * Math.sqrt(2))).to.be.true;
    expect(Util.isNumberEqual(point.y, 5 * Math.sqrt(2))).to.be.true;
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 0)).to.be.true;
    expect(Util.isNumberEqual(point.y, 10)).to.be.true;
    e.rotate(-135 / 180 * Math.PI);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 10)).to.be.true;
    expect(Util.isNumberEqual(point.y, 0)).to.be.true;
  });

  it('scale', function() {
    const e = new Element();
    const point = new Vector3(10, 10, 1);
    e.scale(0.5, 0.5);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 5)).to.be.true;
    expect(Util.isNumberEqual(point.y, 5)).to.be.true;
    e.scale(4, 2);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 10)).to.be.true;
    expect(Util.isNumberEqual(point.y, 5)).to.be.true;
  });

  it('complex', function() {
    const e = new Element();
    const point1 = new Vector3(10, 10, 1);
    e.translate(10, 10);
    e.rotate(Math.PI / 2);
    e.translate(-10, -10);
    e.scale(0.5, 0.5);
    e.apply(point1);

    expect(Util.isNumberEqual(point1.x, -15)).to.be.true;
    expect(Util.isNumberEqual(point1.y, 5)).to.be.true;
  });

  it('transform', function() {
    const e = new Element();
    e.transform([[ 'r', Math.PI / 2 ], [ 't', 10, 10 ], [ 'r', -Math.PI / 2 ]]);
    const point = new Vector3(0, 0, 1);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 10)).to.be.true;
    expect(Util.isNumberEqual(point.y, -10)).to.be.true;
  });

  it('setTransform and invert', function() {
    const e = new Element();
    e.translate(10, 10);
    e.setTransform([[ 'r', Math.PI / 2 ], [ 't', 10, 10 ], [ 'r', -Math.PI / 2 ], [ 's', 0.5, 0.3 ]]);
    const point = new Vector3(0, 0, 1);
    e.apply(point);
    expect(Util.isNumberEqual(point.x, 5)).to.be.true;
    expect(Util.isNumberEqual(point.y, -3)).to.be.true;
    e.invert(point);
    expect(Util.isNumberEqual(point.x, 0)).to.be.true;
    expect(Util.isNumberEqual(point.y, 0)).to.be.true;
    const e1 = new Element();
    e1.setTransform([[ 'm', e.__m ]]);
    e1.apply(point);
    expect(Util.isNumberEqual(point.x, 5)).to.be.true;
    expect(Util.isNumberEqual(point.y, -3)).to.be.true;
    e1.invert(point);
    expect(Util.isNumberEqual(point.x, 0)).to.be.true;
    expect(Util.isNumberEqual(point.y, 0)).to.be.true;
  });

  it('getMatrix', function() {
    const e = new Element();
    const m = e.getMatrix();
    const m1 = new Matrix3();
    expect(m.equal(m1)).to.be.true;
  });
});


const expect = require('chai').expect;
const Element = require('../../../src/core/element');
const Util = require('../../../src/util/index');
const mat3 = require('../../../src/util/matrix').mat3;
const vec3 = require('../../../src/util/matrix').vec3;

describe('Transform', function() {

  it('translate and apply', function() {
    const e = new Element();
    const point = vec3.fromValues(0, 0, 1);
    e.translate(10, 4);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 10)).to.be.true;
    expect(Util.isNumberEqual(point[1], 4)).to.be.true;
  });

  it('rotate', function() {
    const e = new Element();
    const point = vec3.fromValues(10, 0, 0);
    e.rotate(45 / 180 * Math.PI);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 5 * Math.sqrt(2))).to.be.true;
    expect(Util.isNumberEqual(point[1], 5 * Math.sqrt(2))).to.be.true;
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 0)).to.be.true;
    expect(Util.isNumberEqual(point[1], 10)).to.be.true;
    e.rotate(-135 / 180 * Math.PI);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 10)).to.be.true;
    expect(Util.isNumberEqual(point[1], 0)).to.be.true;
  });

  it('scale', function() {
    const e = new Element();
    const point = vec3.fromValues(10, 10, 1);
    e.scale(0.5, 0.5);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 5)).to.be.true;
    expect(Util.isNumberEqual(point[1], 5)).to.be.true;
    e.scale(4, 2);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 10)).to.be.true;
    expect(Util.isNumberEqual(point[1], 5)).to.be.true;
  });

  it('complex', function() {
    const e = new Element();
    const point1 = vec3.fromValues(10, 10, 1);
    e.translate(10, 10);
    e.rotate(Math.PI / 2);
    e.translate(-10, -10);
    e.scale(0.5, 0.5);
    e.apply(point1);

    expect(Util.isNumberEqual(point1[0], -15)).to.be.true;
    expect(Util.isNumberEqual(point1[1], 5)).to.be.true;
  });

  it('transform', function() {
    const e = new Element();
    e.transform([[ 'r', Math.PI / 2 ], [ 't', 10, 10 ], [ 'r', -Math.PI / 2 ]]);
    const point = vec3.fromValues(0, 0, 1);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 10)).to.be.true;
    expect(Util.isNumberEqual(point[1], -10)).to.be.true;
  });

  it('setTransform and invert', function() {
    const e = new Element();
    e.translate(10, 10);
    e.setTransform([[ 'r', Math.PI / 2 ], [ 't', 10, 10 ], [ 'r', -Math.PI / 2 ], [ 's', 0.5, 0.3 ]]);
    const point = vec3.fromValues(0, 0, 1);
    e.apply(point);
    expect(Util.isNumberEqual(point[0], 5)).to.be.true;
    expect(Util.isNumberEqual(point[1], -3)).to.be.true;
    e.invert(point);
    expect(Util.isNumberEqual(point[0], 0)).to.be.true;
    expect(Util.isNumberEqual(point[1], 0)).to.be.true;
    const e1 = new Element();
    e1.setTransform([[ 'm', e.attr('matrix') ]]);
    e1.apply(point);
    expect(Util.isNumberEqual(point[0], 5)).to.be.true;
    expect(Util.isNumberEqual(point[1], -3)).to.be.true;
    e1.invert(point);
    expect(Util.isNumberEqual(point[0], 0)).to.be.true;
    expect(Util.isNumberEqual(point[1], 0)).to.be.true;
  });

  it('getMatrix', function() {
    const e = new Element();
    const m = e.getMatrix();
    const m1 = mat3.create();
    expect(mat3.exactEquals(m, m1)).to.be.true;
  });
});


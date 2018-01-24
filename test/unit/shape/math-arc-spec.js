const expect = require('chai').expect;
const Arc = require('../../../src/shape/math/arc');
const Util = require('../../../src/util/index');

describe('Arc math', function() {
  it('nearAngle', function() {
    const angle = Util.toRadian(20);
    const startAngle = Util.toRadian(0);
    const endAngle = Util.toRadian(90);

    expect(Util.isNumberEqual(Util.toDegree(Arc.nearAngle(angle, startAngle, endAngle)), 20)).to.be.true;
  });

  it('nearAngle1', function() {
    const angle = Util.toRadian(-20);
    const startAngle = Util.toRadian(0);
    const endAngle = Util.toRadian(90);

    expect(Util.isNumberEqual(Util.toDegree(Arc.nearAngle(angle, startAngle, endAngle)), 0)).to.be.true;
  });

  it('nearAngle2', function() {
    const angle = Util.toRadian(110);
    const startAngle = Util.toRadian(90);
    const endAngle = Util.toRadian(-30);

    expect(Util.isNumberEqual(Util.toDegree(Arc.nearAngle(angle, startAngle, endAngle)), 110)).to.be.true;
  });

  it('nearAngle3', function() {
    const angle = Util.toRadian(110);
    const startAngle = Util.toRadian(90);
    const endAngle = Util.toRadian(-30);

    expect(Util.isNumberEqual(Util.toDegree(Arc.nearAngle(angle, startAngle, endAngle)), 110)).to.be.true;
  });

  it('nearAngle4', function() {
    const angle = Util.toRadian(110);
    const startAngle = Util.toRadian(90);
    const endAngle = Util.toRadian(-30);

    expect(Util.isNumberEqual(Util.toDegree(Arc.nearAngle(angle, startAngle, endAngle, true)), 90)).to.be.true;
  });

  // it('nearAngle', function() {
  //   const angle = Util.toRadian(30);
  //   const startAngle = Util.toRadian(0);
  //   const endAngle = Util.toRadian(360);
  // });


  it('arcProjectPoint', function() {
    expect(Util.isNumberEqual(
      Arc.pointDistance(10, 10, 10, -Math.PI / 2, Math.PI / 2, false, 20, 0),
      Math.sqrt(2) * 10 - 10
    )).to.be.true;
  });
});

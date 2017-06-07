var expect = require('@ali/expect.js');
var Arc = require('../../src/g/shape/math/arc');
var gMath = require('@ali/g-math');


describe('Arc math', function() {
  it('nearAngle', function() {
    var angle = gMath.degreeToRad(20);
    var startAngle = gMath.degreeToRad(0);
    var endAngle = gMath.degreeToRad(90);

    expect(gMath.equal(gMath.radToDegree(Arc.nearAngle(angle, startAngle, endAngle)), 20)).to.be(true);
  });

  it('nearAngle1', function() {
    var angle = gMath.degreeToRad(-20);
    var startAngle = gMath.degreeToRad(0);
    var endAngle = gMath.degreeToRad(90);

    expect(gMath.equal(gMath.radToDegree(Arc.nearAngle(angle, startAngle, endAngle)), 0)).to.be(true);
  });

  it('nearAngle2', function() {
    var angle = gMath.degreeToRad(110);
    var startAngle = gMath.degreeToRad(90);
    var endAngle = gMath.degreeToRad(-30);

    expect(gMath.equal(gMath.radToDegree(Arc.nearAngle(angle, startAngle, endAngle)), 110)).to.be(true);
  });

  it('nearAngle3', function() {
    var angle = gMath.degreeToRad(110);
    var startAngle = gMath.degreeToRad(90);
    var endAngle = gMath.degreeToRad(-30);

    expect(gMath.equal(gMath.radToDegree(Arc.nearAngle(angle, startAngle, endAngle)), 110)).to.be(true);
  });

  it('nearAngle4', function() {
    var angle = gMath.degreeToRad(110);
    var startAngle = gMath.degreeToRad(90);
    var endAngle = gMath.degreeToRad(-30);

    expect(gMath.equal(gMath.radToDegree(Arc.nearAngle(angle, startAngle, endAngle, true)), 90)).to.be(true);
  });

  it('nearAngle', function() {
    var angle = gMath.degreeToRad(30);
    var startAngle = gMath.degreeToRad(0);
    var endAngle = gMath.degreeToRad(360);
  });


  it('arcProjectPoint', function() {
    expect(gMath.equal(
      Arc.pointDistance(10, 10, 10, -Math.PI / 2, Math.PI / 2, false, 20, 0),
      Math.sqrt(2) * 10 - 10
    )).to.be(true);
  });
});

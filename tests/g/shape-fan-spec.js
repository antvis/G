var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var gMath = require('@ali/g-math');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-fan';
document.body.appendChild(div);


describe('CFan', function() {
  var canvas = new Canvas({
    containerId: 'canvas-fan',
    width: 200,
    heigth: 200,
    pixelRatio: 1
  });
  G.debug(true);
  var fan = new G.Fan({
    attrs: {
      x: 0,
      y: 0,
      rs: 0,
      re: 0,
      startAngle: 0,
      endAngle: 0,
      clockwise: false
    }
  });
  it('init attr', function() {
    expect(fan.attr('x')).to.be(0);
    expect(fan.attr('y')).to.be(0);
    expect(fan.attr('rs')).to.be(0);
    expect(fan.attr('re')).to.be(0);
    expect(fan.attr('startAngle')).to.be(0);
    expect(fan.attr('endAngle')).to.be(0);
    expect(fan.attr('clockwise')).to.be(false);
    expect(fan.attr('lineWidth')).to.be(1);
    var box = fan.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(0.5);
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(0.5);
  });

  it('x', function() {
    fan.attr('x', 10);
    expect(fan.attr('x')).to.be(10);
    var box = fan.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(10.5);
  });

  it('y', function() {
    fan.attr('y', 20);
    expect(fan.attr('y')).to.be(20);
    var box = fan.getBBox();
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(20.5);
  });

  it('startAngle', function() {
    fan.attr('startAngle', Math.PI);
    expect(gMath.equal(fan.attr('startAngle'), Math.PI)).to.be(true);
  });

  it('endAngle', function() {
    fan.attr('endAngle', Math.PI * 3 / 2);
    expect(gMath.equal(fan.attr('endAngle'), Math.PI * 3 / 2)).to.be(true);
  });

  it('rs', function() {
    expect(fan.attr('rs')).to.be(0);
    fan.attr('rs', 10);
    expect(fan.attr('rs')).to.be(10);
    var box = fan.getBBox();
    expect(gMath.equal(box.minX, -0.5)).to.be(true);
    expect(gMath.equal(box.maxX, 10.5)).to.be(true);
    expect(gMath.equal(box.minY, 9.5)).to.be(true);
    expect(gMath.equal(box.maxY, 20.5)).to.be(true);
  });

  it('re', function() {
    expect(fan.attr('re')).to.be(0);
    fan.attr('re', 30);
    expect(fan.attr('re')).to.be(30);
    canvas.draw();
    var box = fan.getBBox();
    expect(gMath.equal(box.minX, -20.5)).to.be(true);
    expect(gMath.equal(box.maxX, 10.5)).to.be(true);
    expect(gMath.equal(box.minY, -10.5)).to.be(true);
    expect(gMath.equal(box.maxY, 20.5)).to.be(true);
  });

  it('clockwise', function() {
    expect(fan.attr('clockwise')).to.be(false);
    fan.attr('clockwise', true);
    expect(fan.attr('clockwise')).to.be(true);
    var box = fan.getBBox();
    expect(gMath.equal(box.minX, -20.5)).to.be(true);
    expect(gMath.equal(box.maxX, 40.5)).to.be(true);
    expect(gMath.equal(box.minY, -10.5)).to.be(true);
    expect(gMath.equal(box.maxY, 50.5)).to.be(true);
  });

  it('lineWidth', function() {
    expect(fan.attr('lineWidth')).to.be(1);
    fan.attr('lineWidth', 2);
    expect(fan.attr('lineWidth')).to.be(2);
    var box = fan.getBBox();
    expect(gMath.equal(box.minX, -21)).to.be(true);
    expect(gMath.equal(box.maxX, 41)).to.be(true);
    expect(gMath.equal(box.minY, -11)).to.be(true);
    expect(gMath.equal(box.maxY, 51)).to.be(true);
  });

  it('stroke', function() {
    fan.attr({
      x: 40,
      y: 40
    });
    fan.attr('stroke', 'l (210) 0:#ff0000 1:#ffffff');
    expect(fan.attr('stroke')).to.be('l (210) 0:#ff0000 1:#ffffff');
    canvas.add(fan);
    canvas.draw();
  });

  it('fill', function() {
    fan.attr('fill', 'l (130) 0:#0000ff 1:#ffffff');
    expect(fan.attr('fill')).to.be('l (130) 0:#0000ff 1:#ffffff');
    canvas.draw();
  });

  it('isHit', function() {
    expect(fan.isHit(40, 40)).to.be(false);
    expect(fan.isHit(40, 60)).to.be(true);
  });
});























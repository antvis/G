var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('../../src/util/index');
var gMath = require('@ali/g-math');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-arc';
document.body.appendChild(div);
var ratio = Util.getRatio();
describe('Arc line', function() {

  var canvas = new Canvas({
    containerId: 'canvas-arc',
    width: 200,
    height: 200
  });

  canvas.on('canvas-click', function(ev){
    console.log(ev)
  });
  var arc = new G.Arc();
  G.debug(true);
  it('init attrs', function() {
    expect(arc.attr('x')).to.be(0);
    expect(arc.attr('y')).to.be(0);
    expect(arc.attr('r')).to.be(0);
    expect(arc.attr('startAngle')).to.be(0);
    expect(arc.attr('endAngle')).to.be(0);
    expect(arc.attr('clockwise')).to.be(false);
    expect(arc.attr('lineWidth')).to.be(1);
    expect(arc.attr('stroke')).to.be(undefined);

    var box = arc.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(0.5);
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(0.5);
  });

  it('x', function() {
    arc.attr('x', 10);
    expect(arc.attr('x')).to.be(10);
    var box = arc.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(10.5);
  });

  it('y', function() {
    arc.attr('y', 20);
    expect(arc.attr('y')).to.be(20);
    var box = arc.getBBox();
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(20.5);
  });

  it('r', function() {
    arc.attr('r', 30);
    var box = arc.getBBox();
    expect(box.minX).to.be(39.5);
    expect(box.maxX).to.be(40.5);
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(20.5);
  });

  it('startAngle', function() {
    arc.attr('startAngle', 1 / 3 * Math.PI);
    expect(gMath.equal(arc.attr('startAngle'), 1 / 3 * Math.PI)).to.be(true);
    var box = arc.getBBox();
    expect(box.minX).to.be(-20.5);
    expect(box.maxX).to.be(40.5);
    expect(box.minY).to.be(-10.5);
    expect(box.maxY).to.be(50.5);
  });

  it('endAngle', function() {
    arc.attr('endAngle', 120 / 180 * Math.PI);
    expect(gMath.equal(arc.attr('endAngle'), 120 / 180 * Math.PI)).to.be(true);
    var box = arc.getBBox();
    expect(gMath.equal(box.minX, -5.5)).to.be(true);
    expect(gMath.equal(box.maxX, 25.5)).to.be(true);
    expect(gMath.equal(box.minY, 45.48076211353316)).to.be(true);
    expect(gMath.equal(box.maxY, 50.5)).to.be(true);
  });

  it('clockwise', function() {
    expect(arc.attr('clockwise')).to.be(false);
    arc.attr('clockwise', true);
    expect(arc.attr('clockwise')).to.be(true);
    var box = arc.getBBox();
    expect(gMath.equal(box.minX, -20.5)).to.be(true);
    expect(gMath.equal(box.maxX, 40.5)).to.be(true);
    expect(gMath.equal(box.minY, -10.5)).to.be(true);
    expect(gMath.equal(box.maxY, 46.48076211353316)).to.be(true);
  });

  it('lineWidth', function() {
    expect(arc.attr('lineWidth')).to.be(1);
    arc.attr('lineWidth', 2);
    expect(arc.attr('lineWidth')).to.be(2);
    var box = arc.getBBox();
    expect(gMath.equal(box.minX, -21)).to.be(true);
    expect(gMath.equal(box.maxX, 41)).to.be(true);
    expect(gMath.equal(box.minY, -11)).to.be(true);
    expect(gMath.equal(box.maxY, 46.98076211353316)).to.be(true);
  });

  it('stroke', function() {
    arc.attr({
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
      clockwise: false,
      x: 60,
      y: 60,
      r: 20
    })
    arc.attr('stroke', 'l (0) 0:#ff00ff 1:#00ffff');
    expect(arc.attr('stroke')).to.be('l (0) 0:#ff00ff 1:#00ffff');
    canvas.add(arc);
    canvas.draw();
  });

  it('isHit', function() {
    expect(arc.isHit(60 * ratio, 80 * ratio)).to.be(true);
  });

  it('normal', function() {
    var arc = new G.Arc({
      attrs: {
        x: 50,
        y: 50,
        r: 40,
        startAngle: 0,
        endAngle: 110 / 180 * Math.PI,
        stroke: 'red'
      }
    });
    canvas.add(arc);
    canvas.draw();
  });
});

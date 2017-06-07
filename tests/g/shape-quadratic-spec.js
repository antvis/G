var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var gMath = require('@ali/g-math');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-quadratic';
document.body.appendChild(div);


describe('Quadratic line', function() {

  var canvas = new Canvas({
    containerId: 'canvas-quadratic',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  G.debug(true);
  var quadratic = new G.Quadratic();
  it('init quadratic', function() {
    expect(quadratic.attr('p1')).to.be(undefined);
    expect(quadratic.attr('p2')).to.be(undefined);
    expect(quadratic.attr('p3')).to.be(undefined);
    expect(quadratic.attr('lineWidth')).to.be(1);
    expect(quadratic.attr('arrow')).to.be(false);

    expect(quadratic.getBBox()).to.be(null);
  });

  it('p1, p2, p3', function() {
    quadratic.attr({
      p1: [50, 50],
      p2: [80, 12],
      p3: [120, 150]
    });
    expect(quadratic.attr('p1')[0]).to.be(50);
    expect(quadratic.attr('p2')[1]).to.be(12);
    expect(quadratic.attr('p3')[0]).to.be(120);

    var box = quadratic.getBBox('box');
    expect(gMath.equal(box.minX, 49.5)).to.be(true);
    expect(gMath.equal(box.maxX, 120.5)).to.be(true);
    expect(gMath.equal(box.minY, 41.29545454545454)).to.be(true);
    expect(gMath.equal(box.maxY, 150.5)).to.be(true);
  });

  it('stroke', function() {
    quadratic.attr('stroke', 'l (0) 0:#ff00ff 1:#00ffff');
    expect(quadratic.attr('stroke')).to.be('l (0) 0:#ff00ff 1:#00ffff');

    canvas.add(quadratic);
    canvas.draw();
  });

  it('p1', function() {
    quadratic.attr('p1', [70, 39]);
    expect(quadratic.attr('p1')[0]).to.be(70);
    expect(quadratic.attr('p1')[1]).to.be(39);
    var box = quadratic.getBBox();
    expect(gMath.equal(box.minX, 69.5)).to.be(true);
    expect(gMath.equal(box.maxX, 120.5)).to.be(true);
    expect(gMath.equal(box.minY, 34.081818181818186)).to.be(true);
    expect(gMath.equal(box.maxY, 150.5)).to.be(true);
    canvas.draw();
  });

  it('p2', function() {
    quadratic.attr('p2', [90, 80]);
    expect(quadratic.attr('p2')[0]).to.be(90);
    expect(quadratic.attr('p2')[1]).to.be(80);
    var box = quadratic.getBBox();
    expect(gMath.equal(box.minX, 69.5)).to.be(true);
    expect(gMath.equal(box.maxX, 120.5)).to.be(true);
    expect(gMath.equal(box.minY, 38.5)).to.be(true);
    expect(gMath.equal(box.maxY, 150.5)).to.be(true);
    canvas.draw();
  });

  it('p3', function() {
    quadratic.attr('p3', [110, 10]);
    expect(quadratic.attr('p3')[0]).to.be(110);
    expect(quadratic.attr('p3')[1]).to.be(10);
    var box = quadratic.getBBox();
    expect(gMath.equal(box.minX, 69.5)).to.be(true);
    expect(gMath.equal(box.maxX, 110.5)).to.be(true);
    expect(gMath.equal(box.minY, 9.5)).to.be(true);
    expect(gMath.equal(box.maxY, 54.644144144144136)).to.be(true);
    canvas.draw();
  });

  it('lineWidth', function() {
    quadratic.attr('lineWidth', 2);
    expect(quadratic.attr('lineWidth')).to.be(2);
    var box = quadratic.getBBox();
    expect(gMath.equal(box.minX, 69)).to.be(true);
    expect(gMath.equal(box.maxX, 111)).to.be(true);
    expect(gMath.equal(box.minY, 9)).to.be(true);
    expect(gMath.equal(box.maxY, 55.144144144144136)).to.be(true);
    canvas.draw();
  });

  it('isHit', function() {
    expect(quadratic.isHit(70, 39)).to.be(true);
    expect(quadratic.isHit(90, 52.2)).to.be(true);
    expect(quadratic.isHit(110, 10)).to.be(true);
  });

  it('getPoint', function() {
    var quadratic = new G.Quadratic({
      attrs: {
        p1: [100, 100],
        p2: [200, 200],
        p3: [300, 100]
      }
    });

    var point1 = quadratic.getPoint(0);
    expect(point1.x).to.be(100);
    expect(point1.y).to.be(100);
    var point2 = quadratic.getPoint(1);
    expect(point2.x).to.be(300);
    expect(point2.y).to.be(100);
    var point3 = quadratic.getPoint(0.5);
    expect(point3.x).to.be(200);
    expect(point3.y).to.be(150);
    var point4 = quadratic.getPoint(0.3);
    expect(point4.x).to.be(160);
    expect(point4.y).to.be(142);
    expect(quadratic.isHit(160, 142)).to.be(true);
  });
});

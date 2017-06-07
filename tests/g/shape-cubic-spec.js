var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var gMath = require('@ali/g-math');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-cubic';
document.body.appendChild(div);

describe('Cubic line', function() {
  var canvas = new Canvas({
    containerId: 'canvas-cubic',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  G.debug(true);
  var cubic = new G.Cubic();
  it('init cubic', function() {
    expect(cubic.attr('p1')).to.be(undefined);
    expect(cubic.attr('p2')).to.be(undefined);
    expect(cubic.attr('p3')).to.be(undefined);
    expect(cubic.attr('p4')).to.be(undefined);
    expect(cubic.attr('lineWidth')).to.be(1);
    expect(cubic.attr('arrow')).to.be(undefined);

    expect(cubic.getBBox()).to.be(null);
  });

  it('p1, p2, p3, p4', function() {
    cubic.attr({
      p1: [50, 50],
      p2: [80, 12],
      p3: [120, 150],
      p4: [150, 50]
    });
    expect(cubic.attr('p1')[0]).to.be(50);
    expect(cubic.attr('p2')[1]).to.be(12);
    expect(cubic.attr('p3')[0]).to.be(120);
    expect(cubic.attr('p4')[0]).to.be(150);

    var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 49.5)).to.be(true);
    expect(gMath.equal(box.maxX, 150.5)).to.be(true);
    expect(gMath.equal(box.minY, 42.690077140818396)).to.be(true);
    expect(gMath.equal(box.maxY, 87.61466742731623)).to.be(true);
  });

  it('stroke', function() {
    cubic.attr('lineWidth', 5);
    cubic.attr('stroke', 'l (0) 0:#ff00ff 1:#00ffff');
    expect(cubic.attr('stroke')).to.be('l (0) 0:#ff00ff 1:#00ffff');

    canvas.add(cubic);
    canvas.draw();
  });

  it('p1', function() {
    cubic.attr('p1', [70, 39]);
    expect(cubic.attr('p1')[0]).to.be(70);
    expect(cubic.attr('p1')[1]).to.be(39);
    var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 67.5)).to.be(true);
    expect(gMath.equal(box.maxX, 152.5)).to.be(true);
    expect(gMath.equal(box.minY, 32.923853488303024)).to.be(true);
    expect(gMath.equal(box.maxY, 89.38594461401888)).to.be(true);
    canvas.draw();
  });

  it('p2', function() {
    cubic.attr('p2', [90, 80]);
    expect(cubic.attr('p2')[0]).to.be(90);
    expect(cubic.attr('p2')[1]).to.be(80);
    var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 67.5)).to.be(true);
    expect(gMath.equal(box.maxX, 152.5)).to.be(true);
    expect(gMath.equal(box.minY, 36.5)).to.be(true);
    expect(gMath.equal(box.maxY, 103.77723887000138)).to.be(true);
    canvas.draw();
  });

  it('p3', function() {
    cubic.attr('p3', [110, 0]);
    expect(cubic.attr('p3')[0]).to.be(110);
    expect(cubic.attr('p3')[1]).to.be(0);
    var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 67.5)).to.be(true);
    expect(gMath.equal(box.maxX, 152.5)).to.be(true);
    expect(gMath.equal(box.minY, 30.447819730085683)).to.be(true);
    expect(gMath.equal(box.maxY, 53.66354358160779)).to.be(true);
    canvas.draw();
  });

  it('p4', function() {
    console.log(cubic.getBBox());
    cubic.attr('p4', [150, 90]);
    expect(cubic.attr('p4')[0]).to.be(150);
    expect(cubic.attr('p4')[1]).to.be(90);
    /*var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 67.5)).to.be(true);
    expect(gMath.equal(box.maxX, 152.5)).to.be(true);
    expect(gMath.equal(box.minY, 36.5)).to.be(true);
    expect(gMath.equal(box.maxY, 92.5)).to.be(true);
    */
    canvas.draw();
  });

  it('lineWidth', function() {
    cubic.attr('lineWidth', 2);
    expect(cubic.attr('lineWidth')).to.be(2);
    var box = cubic.getBBox();
    expect(gMath.equal(box.minX, 69)).to.be(true);
    expect(gMath.equal(box.maxX, 151)).to.be(true);
    expect(gMath.equal(box.minY, 38)).to.be(true);
    expect(gMath.equal(box.maxY, 91)).to.be(true);
    canvas.draw();
  });

  it('isHit', function() {
    expect(cubic.isHit(70, 39)).to.be(true);
    expect(cubic.isHit(102.5, 46.2)).to.be(true);
    expect(cubic.isHit(150, 90)).to.be(true);
  });

  it('getPoint', function() {
    var cubic = new G.Cubic({
      attrs: {
        p1: [100, 100],
        p2: [200, 200],
        p3: [300, 0],
        p4: [400, 100]
      }
    });

    var point = cubic.getPoint(0);
    expect(point.x).to.be(100);
    expect(point.y).to.be(100);
    var point1 = cubic.getPoint(1);
    expect(point1.x).to.be(400);
    expect(point1.y).to.be(100);
    var point2 = cubic.getPoint(0.25);
    expect(point2.x).to.be(175);
    expect(point2.y).to.be(128.125);
    expect(cubic.isHit(point2.x, point2.y)).to.be(true);
    var point3 = cubic.getPoint(0.5);
    expect(point3.x).to.be(250);
    expect(point3.y).to.be(100);
    expect(cubic.isHit(point3.x, point3.y)).to.be(true);
    var point4 = cubic.getPoint(0.75);
    expect(point4.x).to.be(325);
    expect(point4.y).to.be(71.875);
    expect(cubic.isHit(point4.x, point4.y)).to.be(true);
    var point5 = cubic.getPoint(0.3);
    expect(gMath.equal(point5.x, 190)).to.be(true);
    expect(gMath.equal(point5.y, 125.2)).to.be(true);
    expect(cubic.isHit(point5.x, point5.y)).to.be(true);
  });
});

var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-rect';
document.body.appendChild(div);


describe('Rect', function() {
  var canvas = new Canvas({
    containerId: 'canvas-rect',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  var rect = new G.Rect({
    attrs: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  });
  G.debug(true);
  it('init attrs', function() {
    expect(rect.attr('x')).to.be(0);
    expect(rect.attr('y')).to.be(0);
    expect(rect.attr('width')).to.be(0);
    expect(rect.attr('height')).to.be(0);
    expect(rect.attr('radius')).to.be(0);
    expect(rect.attr('lineWidth')).to.be(1);
    expect(rect.attr('stroke')).to.be(undefined);
    expect(rect.attr('fill')).to.be(undefined);
    var box = rect.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.minY).to.be(-0.5);
    expect(box.maxX).to.be(0.5);
    expect(box.maxY).to.be(0.5);
  });

  it('width', function() {
    expect(rect.attr('width')).to.be(0);
    rect.attr('width', 10);
    expect(rect.attr('width')).to.be(10);
    var box = rect.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(10.5);
    var rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        height: 1,
        width: 15
      }
    });
    expect(rect1.attr('width')).to.be(15);
    var box = rect1.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(15.5);
    var rect2 = new G.Rect({
      attrs: {
        x: 10,
        y: 0,
        width: 15,
        height: 1
      }
    });
    expect(rect2.attr('width')).to.be(15);
    var box = rect2.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(25.5);
  });

  it('height', function() {
    expect(rect.attr('height')).to.be(0);
    rect.attr('height', 20);
    expect(rect.attr('height')).to.be(20);
    var box = rect.getBBox();
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(20.5);
    var rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        height: 25,
        width: 1
      }
    });
    expect(rect1.attr('height')).to.be(25);
    var box = rect1.getBBox();
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(25.5);
    var rect2 = new G.Rect({
      attrs: {
        x: 0,
        y: 10,
        height: 25,
        width: 1
      }
    });
    expect(rect2.attr('height')).to.be(25);
    var box = rect2.getBBox();
    expect(box.minY).to.be(9.5);
    expect(box.maxY).to.be(35.5);
  });

  it('x', function() {
    rect.attr('x', 10);
    expect(rect.attr('x')).to.be(10);
    var box = rect.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(20.5);
    var rect1 = new G.Rect({
      attrs: {
        x: 10,
        y: 0,
        width: 0,
        height: 0
      }
    });
    expect(rect1.attr('x')).to.be(10);
    var box = rect1.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(10.5);
    var rect2 = new G.Rect({
      attrs: {
        x: 20,
        y: 0,
        width: 15,
        height: 0
      }
    });
    expect(rect2.attr('x')).to.be(20);
    var box = rect2.getBBox();
    expect(box.minX).to.be(19.5);
    expect(box.maxX).to.be(35.5);
  });

  it('y', function() {
    rect.attr('y', 20);
    expect(rect.attr('y')).to.be(20);
    var box = rect.getBBox();
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(40.5);
    var rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 12,
        height: 0,
        width: 0
      }
    });
    expect(rect1.attr('y')).to.be(12);
    var box = rect1.getBBox();
    expect(box.minY).to.be(11.5);
    expect(box.maxY).to.be(12.5);
    var rect2 = new G.Rect({
      attrs: {
        x: 0,
        y: 12,
        height: 20,
        width: 0
      }
    });
    expect(rect2.attr('y')).to.be(12);
    var box = rect2.getBBox();
    expect(box.minY).to.be(11.5);
    expect(box.maxY).to.be(32.5);
  });

  it('lineWidth', function() {
    expect(rect.attr('lineWidth')).to.be(1);
    rect.attr('lineWidth', 2);
    expect(rect.attr('lineWidth')).to.be(2);
    var box = rect.getBBox();
    expect(box.minY).to.be(19);
    expect(box.minX).to.be(9);
    expect(box.maxX).to.be(21);
    expect(box.maxY).to.be(41);
    var rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lineWidth: 2
      }
    });
    expect(rect1.attr('lineWidth')).to.be(2);
    var box = rect1.getBBox();
    expect(box.minY).to.be(-1);
    expect(box.minX).to.be(-1);
    expect(box.maxX).to.be(1);
    expect(box.maxY).to.be(1);

    var rect2 = new G.Rect({
      attrs: {
        x: 30,
        y: 40,
        width: 200,
        height: 100,
        lineWidth: 2
      }
    });
    expect(rect2.attr('lineWidth')).to.be(2);
    var box = rect2.getBBox();
    expect(box.minX).to.be(29);
    expect(box.minY).to.be(39);
    expect(box.maxX).to.be(231);
    expect(box.maxY).to.be(141);
  });

  it('radius', function() {
    expect(rect.attr('radius')).to.be(0);
    rect.attr('radius', 3);
    expect(rect.attr('radius')).to.be(3);
  });

  it('stroke', function() {
    rect.attr('stroke', 'l (0) 0:#ff00ff 1:#00ff00');
    expect(rect.attr('stroke')).to.be('l (0) 0:#ff00ff 1:#00ff00');
    canvas.add(rect);
    canvas.draw();
  });

  it('fill',function() {
    rect.attr('fill', 'l (90) 0:#00ffff 1:#ffff00');
    expect(rect.attr('fill')).to.be('l (90) 0:#00ffff 1:#ffff00');
    canvas.draw();
  });

  it('isHit', function() {
    var rect1 = new G.Rect({
      attrs: {
        x: 40,
        y: 40,
        width: 50,
        height: 70
      }
    });

    expect(rect1.isHit(39.5, 39.5)).to.be(false);
    expect(rect1.isHit(40.5, 40.5)).to.be(false);
    expect(rect1.isHit(41, 41)).to.be(false);
    expect(rect1.isHit(70, 39)).to.be(false);
    expect(rect1.isHit(90.5, 110.5)).to.be(false);
    expect(rect1.isHit(43, 43)).to.be(false);
    rect1.attr('stroke', 'red');
    expect(rect1.isHit(39.5, 39.5)).to.be(true);
    expect(rect1.isHit(40.5, 40.5)).to.be(true);
    expect(rect1.isHit(41, 41)).to.be(false);
    expect(rect1.isHit(70, 39)).to.be(false);
    expect(rect1.isHit(70, 39.5)).to.be(true);
    expect(rect1.isHit(90.5, 110.5)).to.be(true);
    expect(rect1.isHit(43, 43)).to.be(false);
    rect1.attr('lineWidth', 2);
    expect(rect1.isHit(70, 39)).to.be(true);
    expect(rect1.isHit(41, 41)).to.be(true);
    rect1.attr('radius', 6);
    expect(rect1.isHit(41, 41)).to.be(false);


    var rect2 = new G.Rect({
      attrs: {
        x: 50,
        y: 50,
        width: 40,
        height: 50
      }
    });
    expect(rect2.isHit(50, 50)).to.be(false);
    expect(rect2.isHit(49.5, 50)).to.be(false);
    expect(rect2.isHit(50, 51)).to.be(false);
    expect(rect2.isHit(51, 51)).to.be(false);
    expect(rect2.isHit(90, 100)).to.be(false);
    expect(rect2.isHit(89, 99)).to.be(false);
    rect2.attr('fill', 'blue');
    expect(rect2.isHit(50, 50)).to.be(false);
    expect(rect2.isHit(49.5, 50)).to.be(false);
    expect(rect2.isHit(50, 51)).to.be(false);
    expect(rect2.isHit(51, 51)).to.be(false);
    expect(rect2.isHit(90, 100)).to.be(false);
    expect(rect2.isHit(89, 99)).to.be(false);
    canvas.add(rect2);
    expect(rect2.isHit(50, 50)).to.be(true);
    expect(rect2.isHit(49.5, 50)).to.be(false);
    expect(rect2.isHit(50, 51)).to.be(true);
    expect(rect2.isHit(51, 51)).to.be(true);
    expect(rect2.isHit(90, 100)).to.be(true);
    expect(rect2.isHit(89, 99)).to.be(true);
    rect2.attr('radius', 5);
    expect(rect2.isHit(50, 50)).to.be(false);
    expect(rect2.isHit(89, 99)).to.be(false);

    var rect3 = new G.Rect({
      attrs: {
        x: 20,
        y: 30,
        width: 100,
        height: 120,
        stroke: 'red',
        fill: 'green',
        lineWidth: 4
      }
    });

    canvas.add(rect3);
    expect(rect3.isHit(18, 28)).to.be(true);
    expect(rect3.isHit(50, 70)).to.be(true);
  });

});

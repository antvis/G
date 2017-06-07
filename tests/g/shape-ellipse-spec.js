var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var gMath = require('@ali/g-math');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-ellipse';
document.body.appendChild(div);


describe('Ellipse', function() {
 
  var canvas = new Canvas({
    containerId: 'canvas-ellipse',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  var ellipse = new G.Ellipse({
    attrs: {
      x: 0,
      y: 0,
      rx: 1,
      ry: 1
    }
  });
  G.debug(true);
  it('init attr', function() {
    expect(ellipse.attr('x')).to.be(0);
    expect(ellipse.attr('y')).to.be(0);
    expect(ellipse.attr('rx')).to.be(1);
    expect(ellipse.attr('ry')).to.be(1);
    expect(ellipse.attr('lineWidth')).to.be(1);
    expect(ellipse.attr('stroke')).to.be(undefined);
    expect(ellipse.attr('fill')).to.be(undefined);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(-1.5);
    expect(box.maxX).to.be(1.5);
    expect(box.minY).to.be(-1.5);
    expect(box.maxY).to.be(1.5);
  });

  it('x', function() {
    ellipse.attr('x', 20);
    expect(ellipse.attr('x')).to.be(20);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(18.5);
    expect(box.maxX).to.be(21.5);
    expect(box.minY).to.be(-1.5);
    expect(box.maxY).to.be(1.5);
  });

  it('y', function() {
    ellipse.attr('y', 30);
    expect(ellipse.attr('y')).to.be(30);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(18.5);
    expect(box.maxX).to.be(21.5);
    expect(box.minY).to.be(28.5);
    expect(box.maxY).to.be(31.5);
  });

  it('rx', function() {
    expect(ellipse.attr('rx')).to.be(1);
    ellipse.attr('rx', 5);
    expect(ellipse.attr('rx')).to.be(5);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(14.5);
    expect(box.maxX).to.be(25.5);
    expect(box.minY).to.be(28.5);
    expect(box.maxY).to.be(31.5);
  });

  it('ry', function() {
    expect(ellipse.attr('ry')).to.be(1);
    ellipse.attr('ry', 10);
    expect(ellipse.attr('ry')).to.be(10);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(14.5);
    expect(box.maxX).to.be(25.5);
    expect(box.minY).to.be(19.5);
    expect(box.maxY).to.be(40.5);
  });


  it('lineWidth', function() {
    expect(ellipse.attr('lineWidth')).to.be(1);
    ellipse.attr('lineWidth', 2);
    expect(ellipse.attr('lineWidth')).to.be(2);
    var box = ellipse.getBBox();
    expect(box.minX).to.be(14);
    expect(box.maxX).to.be(26);
    expect(box.minY).to.be(19);
    expect(box.maxY).to.be(41);
  });

  it('stroke', function() {
    ellipse.attr('stroke', 'l (0) 0:#959231 1:#00cd54');
    expect(ellipse.attr('stroke')).to.be('l (0) 0:#959231 1:#00cd54');
    canvas.add(ellipse);
    canvas.draw();
  });

  it('fill', function() {
    ellipse.attr('fill', 'l (90) 0:#959231 1:#00cd54');
    expect(ellipse.attr('fill')).to.be('l (90) 0:#959231 1:#00cd54');
    canvas.draw();
  });


  it('isHit', function() {
    var ellipse1 = new G.Ellipse({
      attrs: {
        x: 50,
        y: 50,
        rx: 200,
        ry: 100
      }
    });

    expect(ellipse1.isHit(-150, 50)).to.be(false);
    expect(ellipse1.isHit(50, -50)).to.be(false);
    expect(ellipse1.isHit(250, 50)).to.be(false);
    expect(ellipse1.isHit(50, 150)).to.be(false);

    ellipse1.attr('stroke', 'red');
    expect(ellipse1.isHit(-150, 50)).to.be(true);
    expect(ellipse1.isHit(50, -50)).to.be(true);
    expect(ellipse1.isHit(250, 50)).to.be(true);
    expect(ellipse1.isHit(50, 150)).to.be(true);

    var ellipse2 = new G.Ellipse({
      attrs: {
        x: 100,
        y: 200,
        rx: 50,
        ry: 80
      }
    });

    expect(ellipse2.isHit(70, 200)).to.be(false);
    expect(ellipse2.isHit(100, 150)).to.be(false);
    expect(ellipse2.isHit(130, 200)).to.be(false);
    expect(ellipse2.isHit(100, 230)).to.be(false);

    ellipse2.attr('fill', 'green');

    expect(ellipse2.isHit(70, 200)).to.be(true);
    expect(ellipse2.isHit(100, 150)).to.be(true);
    expect(ellipse2.isHit(130, 200)).to.be(true);
    expect(ellipse2.isHit(100, 230)).to.be(true);

    var ellipse3 = new G.Ellipse({
      attrs: {
        x: 200,
        y: 200,
        rx: 50,
        ry: 100
      }
    });

    expect(ellipse3.isHit(150, 200)).to.be(false);
    expect(ellipse3.isHit(250, 200)).to.be(false);
    expect(ellipse3.isHit(200, 100)).to.be(false);
    expect(ellipse3.isHit(200, 300)).to.be(false);
    expect(ellipse3.isHit(170, 200)).to.be(false);
    ellipse3.attr({
      fill: 'green',
      stroke: 'red'
    });
    expect(ellipse3.isHit(150, 200)).to.be(true);
    expect(ellipse3.isHit(250, 200)).to.be(true);
    expect(ellipse3.isHit(200, 100)).to.be(true);
    expect(ellipse3.isHit(200, 300)).to.be(true);
    expect(ellipse3.isHit(170, 200)).to.be(true);
  });







});

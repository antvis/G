var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-line';
document.body.appendChild(div);

describe('Line', function() {

  var canvas = new Canvas({
    containerId: 'canvas-line',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  G.debug(true);
  var line = new G.Line({
    attrs: {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
      arrow: false
    }
  });
  it('init attrs', function() {
    expect(line.attr('x1')).to.be(0);
    expect(line.attr('y1')).to.be(0);
    expect(line.attr('x2')).to.be(0);
    expect(line.attr('y2')).to.be(0);
    expect(line.attr('lineWidth')).to.be(1);
    expect(line.attr('stroke')).to.be(undefined);
    expect(line.attr('fill')).to.be(undefined);
    expect(line.attr('arrow')).to.be(false);
    var box = line.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(0.5);
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(0.5);
  });

  it('x1', function() {
    line.attr('x1', 10);
    expect(line.attr('x1')).to.be(10);
    var box = line.getBBox();
    expect(box.minX).to.be(-0.5);
    expect(box.maxX).to.be(10.5);
  });

  it('y1', function() {
    line.attr('y1', 15);
    expect(line.attr('y1')).to.be(15);
    var box = line.getBBox();
    expect(box.minY).to.be(-0.5);
    expect(box.maxY).to.be(15.5);
  });

  it('x2', function() {
    line.attr('x2', 59);
    expect(line.attr('x2')).to.be(59);
    var box = line.getBBox();
    expect(box.minX).to.be(9.5);
    expect(box.maxX).to.be(59.5);
  });

  it('y2', function() {
    line.attr('y2', 80);
    expect(line.attr('y2')).to.be(80);
    var box = line.getBBox();
    expect(box.minY).to.be(14.5);
    expect(box.maxY).to.be(80.5);
  });

  it('lineWidth', function() {
    expect(line.attr('lineWidth')).to.be(1);
    line.attr('lineWidth', 2);
    expect(line.attr('lineWidth')).to.be(2);
    var box = line.getBBox();
    expect(box.minX).to.be(9);
    expect(box.maxX).to.be(60);
    expect(box.minY).to.be(14);
    expect(box.maxY).to.be(81);
  });

  it('stroke', function() {
    line.attr('stroke', 'l (0) 0.1:#0fedae 1:#6542da');
    expect(line.attr('stroke')).to.be('l (0) 0.1:#0fedae 1:#6542da');
    canvas.add(line);
    canvas.draw();
  });

  it('isHit', function() {
    expect(line.isHit(9, 14)).to.be(true);
    expect(line.isHit(34.5, 47.5)).to.be(true);
    expect(line.isHit(8, 11)).to.be(false);
    var line1 = new G.Line({
      attrs: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100
      }
    });
    expect(line1.isHit(101, 101)).to.be(false);
    expect(line1.isHit(100, 100)).to.be(false);
    line1.attr('stroke', 'red');
    expect(line1.isHit(101, 101)).to.be(false);
    expect(line1.isHit(100, 100)).to.be(true);
  });

  it('arrow', function() {
    line.attr('arrow', true);
    expect(line.attr('arrow')).to.be(true);
    canvas.draw();
  });

  it('getPoint', function() {
    var line = new G.Line({
      attrs: {
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 300
      }
    });

    var point = line.getPoint(0.5);
    expect(point.x).to.be(100);
    expect(point.y).to.be(150);
  });
});














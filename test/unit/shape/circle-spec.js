const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-circle';
document.body.appendChild(div);
describe('Circle', function() {
  const canvas = new Canvas({
    containerId: 'canvas-circle',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const circle = new G.Circle({
    attrs: {
      x: 0,
      y: 0,
      r: 0
    }
  });

  it('init attr', function() {
    expect(circle.attr('lineWidth')).to.equal(1);
    expect(circle.attr('stroke')).to.be.undefined;
    expect(circle.attr('fill')).to.be.undefined;
    const box = circle.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(0.5);
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(0.5);
  });

  it('x', function() {
    circle.attr('x', 10);
    expect(circle.attr('x')).to.equal(10);
    const box = circle.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(10.5);
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(0.5);
  });

  it('y', function() {
    circle.attr('y', 20);
    expect(circle.attr('y')).to.equal(20);
    const box = circle.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(10.5);
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(20.5);
  });

  it('r', function() {
    expect(circle.attr('r')).to.equal(0);
    circle.attr('r', 10);
    expect(circle.attr('r')).to.equal(10);
    const box = circle.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(20.5);
    expect(box.minY).to.equal(9.5);
    expect(box.maxY).to.equal(30.5);
  });

  it('lineWidth', function() {
    expect(circle.attr('lineWidth')).to.equal(1);
    circle.attr('lineWidth', 2);
    expect(circle.attr('lineWidth')).to.equal(2);
    const box = circle.getBBox();
    expect(box.minX).to.equal(-1);
    expect(box.maxX).to.equal(21);
    expect(box.minY).to.equal(9);
    expect(box.maxY).to.equal(31);
  });

  it('stroke', function() {
    circle.attr('stroke', 'l (30) 0:#00ffff 1:#ff00ff');
    expect(circle.attr('stroke')).to.equal('l (30) 0:#00ffff 1:#ff00ff');
    canvas.add(circle);
    canvas.draw(circle);
  });

  it('fill', function() {
    circle.attr('fill', 'r (0.5, 0.5, 0) 0:#00ffff 1:#ffff00');
    expect(circle.attr('fill')).to.equal('r (0.5, 0.5, 0) 0:#00ffff 1:#ffff00');
    canvas.draw(circle);
  });

  it('isHit', function() {
    const circle1 = new G.Circle({
      attrs: {
        x: 50,
        y: 50,
        r: 50
      }
    });

    expect(circle1.isHit(0, 50)).to.be.false;
    expect(circle1.isHit(50, 0)).to.be.false;
    expect(circle1.isHit(100, 50)).to.be.false;
    expect(circle1.isHit(50, 100)).to.be.false;
    circle1.attr('stroke', 'red');

    expect(circle1.isHit(0, 50)).to.be.true;
    expect(circle1.isHit(50, 0)).to.be.true;
    expect(circle1.isHit(100, 50)).to.be.true;
    expect(circle1.isHit(50, 100)).to.be.true;
    expect(circle1.isHit(20, 50)).to.be.false;
    expect(circle1.isHit(50, 20)).to.be.false;
    expect(circle1.isHit(80, 50)).to.be.false;
    expect(circle1.isHit(50, 80)).to.be.false;

    const circle2 = new G.Circle({
      attrs: {
        x: 50,
        y: 50,
        r: 50
      }
    });

    expect(circle2.isHit(20, 50)).to.be.false;
    expect(circle2.isHit(50, 20)).to.be.false;
    expect(circle2.isHit(80, 50)).to.be.false;
    expect(circle2.isHit(50, 80)).to.be.false;
    circle2.attr('fill', 'green');
    expect(circle2.isHit(20, 50)).to.be.true;
    expect(circle2.isHit(50, 20)).to.be.true;
    expect(circle2.isHit(80, 50)).to.be.true;
    expect(circle2.isHit(50, 80)).to.be.true;

    circle2.attr('stroke', 'red');
    expect(circle2.isHit(0, 50)).to.be.true;
    expect(circle2.isHit(50, 0)).to.be.true;
    expect(circle2.isHit(100, 50)).to.be.true;
    expect(circle2.isHit(50, 100)).to.be.true;
    expect(circle2.isHit(20, 50)).to.be.true;
    expect(circle2.isHit(50, 20)).to.be.true;
    expect(circle2.isHit(80, 50)).to.be.true;
    expect(circle2.isHit(50, 80)).to.be.true;
  });

  it('strokeOpactiy', function() {
    const circle = new G.Circle({
      attrs: {
        x: 150,
        y: 150,
        r: 100,
        stroke: 'red',
        strokeOpactiy: 0.4
      }
    });

    canvas.add(circle);
    canvas.draw();
  });

});


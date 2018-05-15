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
  canvas.add(circle);
  it('init attr', function() {
    expect(circle.attr('lineWidth')).to.equal(1);
    expect(circle.attr('stroke')).to.be.undefined;
    expect(circle.attr('fill')).to.equal('none');
    const box = circle.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.maxX).to.equal(0);
    expect(box.minY).to.equal(0);
    expect(box.maxY).to.equal(0);
  });

  it('x', function() {
    circle.attr('x', 10);
    expect(circle.attr('x')).to.equal(10);
    const box = circle.getBBox();
    expect(box.minX).to.equal(10);
    expect(box.maxX).to.equal(10);
    expect(box.minY).to.equal(0);
    expect(box.maxY).to.equal(0);
  });

  it('y', function() {
    circle.attr('y', 20);
    expect(circle.attr('y')).to.equal(20);
    const box = circle.getBBox();
    expect(box.minX).to.equal(10);
    expect(box.maxX).to.equal(10);
    expect(box.minY).to.equal(20);
    expect(box.maxY).to.equal(20);
  });

  it('r', function() {
    expect(circle.attr('r')).to.equal(0);
    circle.attr('r', 10);
    expect(circle.attr('r')).to.equal(10);
    const box = circle.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.maxX).to.equal(20);
    expect(box.minY).to.equal(10);
    expect(box.maxY).to.equal(30);
  });

  it('lineWidth', function() {
    expect(circle.attr('lineWidth')).to.equal(1);
    circle.attr('lineWidth', 2);
    expect(circle.attr('lineWidth')).to.equal(2);
    const box = circle.getBBox();
    expect(box.minX).to.equal(0);
    expect(box.maxX).to.equal(20);
    expect(box.minY).to.equal(10);
    expect(box.maxY).to.equal(30);
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


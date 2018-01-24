const expect = require('chai').expect;
const G = require('../../../src/index');
const Util = require('../../../src/util/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-arc';
document.body.appendChild(div);
const ratio = Util.getRatio();
describe('Arc line', function() {

  const canvas = new Canvas({
    containerId: 'canvas-arc',
    width: 200,
    height: 200
  });

  canvas.on('canvas-click', function(ev) {
    console.log(ev);
  });
  const arc = new G.Arc();
  it('init attrs', function() {
    expect(arc.attr('x')).to.equal(0);
    expect(arc.attr('y')).to.equal(0);
    expect(arc.attr('r')).to.equal(0);
    expect(arc.attr('startAngle')).to.equal(0);
    expect(arc.attr('endAngle')).to.equal(0);
    expect(arc.attr('clockwise')).to.be.false;
    expect(arc.attr('lineWidth')).to.equal(1);
    expect(arc.attr('stroke')).to.be.undefined;

    const box = arc.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(0.5);
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(0.5);
  });

  it('x', function() {
    arc.attr('x', 10);
    expect(arc.attr('x')).to.equal(10);
    const box = arc.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(10.5);
  });

  it('y', function() {
    arc.attr('y', 20);
    expect(arc.attr('y')).to.equal(20);
    const box = arc.getBBox();
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(20.5);
  });

  it('r', function() {
    arc.attr('r', 30);
    const box = arc.getBBox();
    expect(box.minX).to.equal(39.5);
    expect(box.maxX).to.equal(40.5);
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(20.5);
  });

  it('startAngle', function() {
    arc.attr('startAngle', 1 / 3 * Math.PI);
    expect(Util.isNumberEqual(arc.attr('startAngle'), 1 / 3 * Math.PI)).to.be.true;
    const box = arc.getBBox();
    expect(box.minX).to.equal(-20.5);
    expect(box.maxX).to.equal(40.5);
    expect(box.minY).to.equal(-10.5);
    expect(box.maxY).to.equal(50.5);
  });

  it('endAngle', function() {
    arc.attr('endAngle', 120 / 180 * Math.PI);
    expect(Util.isNumberEqual(arc.attr('endAngle'), 120 / 180 * Math.PI)).to.be.true;
    const box = arc.getBBox();
    expect(Util.isNumberEqual(box.minX, -5.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 25.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 45.48076211353316)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 50.5)).to.be.true;
  });

  it('clockwise', function() {
    expect(arc.attr('clockwise')).to.be.false;
    arc.attr('clockwise', true);
    expect(arc.attr('clockwise')).to.be.true;
    const box = arc.getBBox();
    expect(Util.isNumberEqual(box.minX, -20.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 40.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, -10.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 46.48076211353316)).to.be.true;
  });

  it('lineWidth', function() {
    expect(arc.attr('lineWidth')).to.equal(1);
    arc.attr('lineWidth', 2);
    expect(arc.attr('lineWidth')).to.equal(2);
    const box = arc.getBBox();
    expect(Util.isNumberEqual(box.minX, -21)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 41)).to.be.true;
    expect(Util.isNumberEqual(box.minY, -11)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 46.98076211353316)).to.be.true;
  });

  it('stroke', function() {
    arc.attr({
      startAngle: -Math.PI,
      endAngle: Math.PI / 2,
      clockwise: false,
      x: 60,
      y: 60,
      r: 20
    });
    arc.attr('stroke', 'l (0) 0:#ff00ff 1:#00ffff');
    expect(arc.attr('stroke')).to.equal('l (0) 0:#ff00ff 1:#00ffff');
    canvas.add(arc);
    canvas.draw();
  });

  it('arrow', function() {
    arc.attr('startArrow', true);
    arc.attr('endArrow', true);
    arc.attr('arrowLength', 5);
    arc.attr('lineWidth', 1);
    arc.attr('arrowAngle', 90);
    expect(arc.attr('startArrow')).to.be.true;
    expect(arc.attr('endArrow')).to.be.true;
    expect(arc.attr('arrowLength')).to.equal(5);
    expect(arc.attr('arrowAngle')).to.equal(90);
    canvas.draw();
  });

  it('isHit', function() {
    expect(arc.isHit(60 * ratio, 80 * ratio)).to.be.true;
  });

  it('normal', function() {
    const arc = new G.Arc({
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

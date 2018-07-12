const expect = require('chai').expect;
const G = require('../../../../src/index');
const Canvas = G.Canvas;
const Util = require('../../../../src/util/index');
const div = document.createElement('div');
div.id = 'canvas-fan';
document.body.appendChild(div);

describe('CFan', function() {
  const canvas = new Canvas({
    containerId: 'canvas-fan',
    width: 200,
    height: 200,
    pixelRatio: 1,
    renderer: 'svg'
  });

  const fan = new G.Fan({
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
  canvas.add(fan);
  it('init attr', function() {
    expect(fan.attr('rs')).to.equal(0);
    expect(fan.attr('re')).to.equal(0);
    expect(fan.attr('startAngle')).to.equal(0);
    expect(fan.attr('endAngle')).to.equal(0);
    expect(fan.attr('clockwise')).to.be.false;
    expect(fan.attr('lineWidth')).to.equal(1);
  });

  it('x', function() {
    fan.attr('x', 10);
    expect(fan.attr('x')).to.equal(10);
  });

  it('y', function() {
    fan.attr('y', 20);
    expect(fan.attr('y')).to.equal(20);
  });

  it('startAngle', function() {
    fan.attr('startAngle', Math.PI);
    expect(Util.isNumberEqual(fan.attr('startAngle'), Math.PI)).to.be.true;
  });

  it('endAngle', function() {
    fan.attr('endAngle', Math.PI * 3 / 2);
    expect(Util.isNumberEqual(fan.attr('endAngle'), Math.PI * 3 / 2)).to.be.true;
  });

  it('rs', function() {
    expect(fan.attr('rs')).to.equal(0);
    fan.attr('rs', 10);
    expect(fan.attr('rs')).to.equal(10);
  });

  it('re', function() {
    expect(fan.attr('re')).to.equal(0);
    fan.attr('re', 30);
    expect(fan.attr('re')).to.equal(30);
    canvas.draw();
  });

  it('clockwise', function() {
    expect(fan.attr('clockwise')).to.be.false;
    fan.attr('clockwise', true);
    expect(fan.attr('clockwise')).to.be.true;
  });

  it('lineWidth', function() {
    expect(fan.attr('lineWidth')).to.equal(1);
    fan.attr('lineWidth', 2);
    expect(fan.attr('lineWidth')).to.equal(2);
  });

  it('stroke', function() {
    fan.attr({
      x: 100,
      y: 100
    });
    fan.attr('stroke', 'l (210) 0:#ff0000 1:#ffffff');
    expect(fan.attr('stroke')).to.equal('l (210) 0:#ff0000 1:#ffffff');
    canvas.draw();
  });

  it('fill', function() {
    fan.attr('fill', 'l (130) 0:#0000ff 1:#ffffff');
    expect(fan.attr('fill')).to.equal('l (130) 0:#0000ff 1:#ffffff');
    canvas.draw();
  });
});


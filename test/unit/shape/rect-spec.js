const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-rect';
document.body.appendChild(div);

describe('Rect', function() {
  const canvas = new Canvas({
    containerId: 'canvas-rect',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const rect = new G.Rect({
    attrs: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  });

  it('init attrs', function() {
    expect(rect.attr('x')).to.equal(0);
    expect(rect.attr('y')).to.equal(0);
    expect(rect.attr('width')).to.equal(0);
    expect(rect.attr('height')).to.equal(0);
    expect(rect.attr('radius')).to.equal(0);
    expect(rect.attr('lineWidth')).to.equal(1);
    expect(rect.attr('stroke')).to.be.undefined;
    expect(rect.attr('fill')).to.be.undefined;
    const box = rect.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.minY).to.equal(-0.5);
    expect(box.maxX).to.equal(0.5);
    expect(box.maxY).to.equal(0.5);
  });

  it('width', function() {
    expect(rect.attr('width')).to.equal(0);
    rect.attr('width', 10);
    expect(rect.attr('width')).to.equal(10);
    let box = rect.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(10.5);
    const rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        height: 1,
        width: 15
      }
    });
    expect(rect1.attr('width')).to.equal(15);
    box = rect1.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(15.5);
    const rect2 = new G.Rect({
      attrs: {
        x: 10,
        y: 0,
        width: 15,
        height: 1
      }
    });
    expect(rect2.attr('width')).to.equal(15);
    box = rect2.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(25.5);
  });

  it('height', function() {
    expect(rect.attr('height')).to.equal(0);
    rect.attr('height', 20);
    expect(rect.attr('height')).to.equal(20);
    let box = rect.getBBox();
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(20.5);
    const rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        height: 25,
        width: 1
      }
    });
    expect(rect1.attr('height')).to.equal(25);
    box = rect1.getBBox();
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(25.5);
    const rect2 = new G.Rect({
      attrs: {
        x: 0,
        y: 10,
        height: 25,
        width: 1
      }
    });
    expect(rect2.attr('height')).to.equal(25);
    box = rect2.getBBox();
    expect(box.minY).to.equal(9.5);
    expect(box.maxY).to.equal(35.5);
  });

  it('x', function() {
    rect.attr('x', 10);
    expect(rect.attr('x')).to.equal(10);
    let box = rect.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(20.5);
    const rect1 = new G.Rect({
      attrs: {
        x: 10,
        y: 0,
        width: 0,
        height: 0
      }
    });
    expect(rect1.attr('x')).to.equal(10);
    box = rect1.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(10.5);
    const rect2 = new G.Rect({
      attrs: {
        x: 20,
        y: 0,
        width: 15,
        height: 0
      }
    });
    expect(rect2.attr('x')).to.equal(20);
    box = rect2.getBBox();
    expect(box.minX).to.equal(19.5);
    expect(box.maxX).to.equal(35.5);
  });

  it('y', function() {
    rect.attr('y', 20);
    expect(rect.attr('y')).to.equal(20);
    let box = rect.getBBox();
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(40.5);
    const rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 12,
        height: 0,
        width: 0
      }
    });
    expect(rect1.attr('y')).to.equal(12);
    box = rect1.getBBox();
    expect(box.minY).to.equal(11.5);
    expect(box.maxY).to.equal(12.5);
    const rect2 = new G.Rect({
      attrs: {
        x: 0,
        y: 12,
        height: 20,
        width: 0
      }
    });
    expect(rect2.attr('y')).to.equal(12);
    box = rect2.getBBox();
    expect(box.minY).to.equal(11.5);
    expect(box.maxY).to.equal(32.5);
  });

  it('lineWidth', function() {
    expect(rect.attr('lineWidth')).to.equal(1);
    rect.attr('lineWidth', 2);
    expect(rect.attr('lineWidth')).to.equal(2);
    let box = rect.getBBox();
    expect(box.minY).to.equal(19);
    expect(box.minX).to.equal(9);
    expect(box.maxX).to.equal(21);
    expect(box.maxY).to.equal(41);
    const rect1 = new G.Rect({
      attrs: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lineWidth: 2
      }
    });
    expect(rect1.attr('lineWidth')).to.equal(2);
    box = rect1.getBBox();
    expect(box.minY).to.equal(-1);
    expect(box.minX).to.equal(-1);
    expect(box.maxX).to.equal(1);
    expect(box.maxY).to.equal(1);

    const rect2 = new G.Rect({
      attrs: {
        x: 30,
        y: 40,
        width: 200,
        height: 100,
        lineWidth: 2
      }
    });
    expect(rect2.attr('lineWidth')).to.equal(2);
    box = rect2.getBBox();
    expect(box.minX).to.equal(29);
    expect(box.minY).to.equal(39);
    expect(box.maxX).to.equal(231);
    expect(box.maxY).to.equal(141);
  });

  it('radius', function() {
    expect(rect.attr('radius')).to.equal(0);
    rect.attr('radius', 3);
    expect(rect.attr('radius')).to.equal(3);
  });

  it('stroke', function() {
    rect.attr('stroke', 'l (0) 0:#ff00ff 1:#00ff00');
    expect(rect.attr('stroke')).to.equal('l (0) 0:#ff00ff 1:#00ff00');
    canvas.add(rect);
    canvas.draw();
  });

  it('fill', function() {
    rect.attr('fill', 'l (90) 0:#00ffff 1:#ffff00');
    expect(rect.attr('fill')).to.equal('l (90) 0:#00ffff 1:#ffff00');
    canvas.draw();
  });

  it('isHit', function() {
    const rect1 = new G.Rect({
      attrs: {
        x: 40,
        y: 40,
        width: 50,
        height: 70
      }
    });

    expect(rect1.isHit(39.5, 39.5)).to.be.false;
    expect(rect1.isHit(40.5, 40.5)).to.be.false;
    expect(rect1.isHit(41, 41)).to.be.false;
    expect(rect1.isHit(70, 39)).to.be.false;
    expect(rect1.isHit(90.5, 110.5)).to.be.false;
    expect(rect1.isHit(43, 43)).to.be.false;
    rect1.attr('stroke', 'red');
    expect(rect1.isHit(39.5, 39.5)).to.be.true;
    expect(rect1.isHit(40.5, 40.5)).to.be.true;
    expect(rect1.isHit(41, 41)).to.be.false;
    expect(rect1.isHit(70, 39)).to.be.false;
    expect(rect1.isHit(70, 39.5)).to.be.true;
    expect(rect1.isHit(90.5, 110.5)).to.be.true;
    expect(rect1.isHit(43, 43)).to.be.false;
    rect1.attr('lineWidth', 2);
    expect(rect1.isHit(70, 39)).to.be.true;
    expect(rect1.isHit(41, 41)).to.be.true;
    rect1.attr('radius', 6);
    expect(rect1.isHit(41, 41)).to.be.false;


    const rect2 = new G.Rect({
      attrs: {
        x: 50,
        y: 50,
        width: 40,
        height: 50
      }
    });
    expect(rect2.isHit(50, 50)).to.be.false;
    expect(rect2.isHit(49.5, 50)).to.be.false;
    expect(rect2.isHit(50, 51)).to.be.false;
    expect(rect2.isHit(51, 51)).to.be.false;
    expect(rect2.isHit(90, 100)).to.be.false;
    expect(rect2.isHit(89, 99)).to.be.false;
    rect2.attr('fill', 'blue');
    expect(rect2.isHit(50, 50)).to.be.false;
    expect(rect2.isHit(49.5, 50)).to.be.false;
    expect(rect2.isHit(50, 51)).to.be.false;
    expect(rect2.isHit(51, 51)).to.be.false;
    expect(rect2.isHit(90, 100)).to.be.false;
    expect(rect2.isHit(89, 99)).to.be.false;
    canvas.add(rect2);
    expect(rect2.isHit(50, 50)).to.be.true;
    expect(rect2.isHit(49.5, 50)).to.be.false;
    expect(rect2.isHit(50, 51)).to.be.true;
    expect(rect2.isHit(51, 51)).to.be.true;
    expect(rect2.isHit(90, 100)).to.be.true;
    expect(rect2.isHit(89, 99)).to.be.true;
    rect2.attr('radius', 5);
    expect(rect2.isHit(50, 50)).to.be.false;
    expect(rect2.isHit(89, 99)).to.be.false;

    const rect3 = new G.Rect({
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
    expect(rect3.isHit(18, 28)).to.be.true;
    expect(rect3.isHit(50, 70)).to.be.true;
  });

});

const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-line';
document.body.appendChild(div);

describe('Line', function() {

  const canvas = new Canvas({
    containerId: 'canvas-line',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  const line = new G.Line({
    attrs: {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0
    }
  });
  it('init attrs', function() {
    expect(line.attr('x1')).to.equal(0);
    expect(line.attr('y1')).to.equal(0);
    expect(line.attr('x2')).to.equal(0);
    expect(line.attr('y2')).to.equal(0);
    expect(line.attr('lineWidth')).to.equal(1);
    expect(line.attr('stroke')).to.be.undefined;
    expect(line.attr('fill')).to.be.undefined;
    expect(line.attr('startArrow')).to.be.false;
    expect(line.attr('endArrow')).to.be.false;
    const box = line.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(0.5);
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(0.5);
  });

  it('x1', function() {
    line.attr('x1', 10);
    expect(line.attr('x1')).to.equal(10);
    const box = line.getBBox();
    expect(box.minX).to.equal(-0.5);
    expect(box.maxX).to.equal(10.5);
  });

  it('y1', function() {
    line.attr('y1', 15);
    expect(line.attr('y1')).to.equal(15);
    const box = line.getBBox();
    expect(box.minY).to.equal(-0.5);
    expect(box.maxY).to.equal(15.5);
  });

  it('x2', function() {
    line.attr('x2', 59);
    expect(line.attr('x2')).to.equal(59);
    const box = line.getBBox();
    expect(box.minX).to.equal(9.5);
    expect(box.maxX).to.equal(59.5);
  });

  it('y2', function() {
    line.attr('y2', 80);
    expect(line.attr('y2')).to.equal(80);
    const box = line.getBBox();
    expect(box.minY).to.equal(14.5);
    expect(box.maxY).to.equal(80.5);
  });

  it('lineWidth', function() {
    expect(line.attr('lineWidth')).to.equal(1);
    line.attr('lineWidth', 2);
    expect(line.attr('lineWidth')).to.equal(2);
    const box = line.getBBox();
    expect(box.minX).to.equal(9);
    expect(box.maxX).to.equal(60);
    expect(box.minY).to.equal(14);
    expect(box.maxY).to.equal(81);
  });

  it('stroke', function() {
    line.attr('stroke', 'l (0) 0.1:#0fedae 1:#6542da');
    expect(line.attr('stroke')).to.equal('l (0) 0.1:#0fedae 1:#6542da');
    canvas.add(line);
    canvas.draw();
  });

  it('isHit', function() {
    expect(line.isHit(9, 14)).to.be.true;
    expect(line.isHit(34.5, 47.5)).to.be.true;
    expect(line.isHit(8, 11)).to.be.false;
    const line1 = new G.Line({
      attrs: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100
      }
    });
    expect(line1.isHit(101, 101)).to.be.false;
    expect(line1.isHit(100, 100)).to.be.false;
    line1.attr('stroke', 'red');
    expect(line1.isHit(101, 101)).to.be.false;
    expect(line1.isHit(100, 100)).to.be.true;
  });

  it('arrow', function() {
    line.attr({
      startArrow: true,
      endArrow: new G.Marker({
        attrs: {
          symbol: 'triangle'
        }
      })
    });
    canvas.addShape('line', {
      attrs: {
        startArrow: new G.Marker({
          attrs: {
            symbol: 'triangle'
          }
        }),
        endArrow: new G.Marker({
          attrs: {
            symbol: 'triangle'
          }
        }),
        arrowLength: 15,
        x1: 80,
        y1: 80,
        x2: 150,
        y2: 60,
        stroke: 'l (0) 0.1:#0fedae 1:#6542da',
        lineWidth: 8
      }
    });
    canvas.addShape('line', {
      attrs: {
        startArrow: new G.Marker({
          attrs: {
            symbol: 'circle'
          }
        }),
        endArrow: new G.Marker({
          attrs: {
            symbol: 'square'
          }
        }),
        arrowLength: 15,
        x1: 180,
        y1: 60,
        x2: 180,
        y2: 150,
        stroke: '#000',
        lineWidth: 2
      }
    });
    canvas.addShape('line', {
      attrs: {
        startArrow: new G.Marker({
          attrs: {
            symbol: 'triangle'
          }
        }),
        endArrow: true,
        arrowLength: 15,
        x1: 30,
        y1: 30,
        x2: 180,
        y2: 30,
        stroke: '#000',
        lineWidth: 2
      }
    });
    canvas.draw();
  });

  it('getPoint', function() {
    const line = new G.Line({
      attrs: {
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 300
      }
    });

    const point = line.getPoint(0.5);
    expect(point.x).to.equal(100);
    expect(point.y).to.equal(150);
  });
});


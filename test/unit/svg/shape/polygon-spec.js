const expect = require('chai').expect;
const G = require('../../../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'canvas-polygon';
document.body.appendChild(div);

describe('Polygon', () => {

  const canvas = new Canvas({
    containerId: 'canvas-polygon',
    width: 200,
    height: 200,
    pixelRatio: 1,
    renderer: 'svg'
  });

  const polygon = new G.Polygon();
  canvas.add(polygon);
  it('init attr', () => {
    expect(polygon.attr('points')).to.be.undefined;
    expect(polygon.attr('lineWidth')).to.equal(1);
    expect(polygon.attr('stroke')).to.be.undefined;
    expect(polygon.attr('fill')).to.be.undefined;
    expect(polygon.getBBox()).to.be.null;
  });

  it('points', () => {
    polygon.attr('points', []);
    expect(polygon.attr('points').length).to.equal(0);
    // expect(polygon.getBBox()).to.be.null;
    polygon.attr('points', [[ 30, 30 ], [ 40, 20 ], [ 30, 50 ], [ 60, 100 ]]);
    expect(polygon.attr('points').length).to.equal(4);
    let box = polygon.getBBox();
    expect(box.minX).to.equal(29.5);
    expect(box.maxX).to.equal(60.5);
    expect(box.minY).to.equal(19.5);
    expect(box.maxY).to.equal(100.5);

    const polygon1 = new G.Polygon({
      attrs: {
        points: [[ 58, 60 ], [ 80, 190 ], [ 32, 53 ], [ 45, 32 ]]
      }
    });
    box = polygon1.getBBox();
    expect(box.minX).to.equal(31.5);
    expect(box.minY).to.equal(31.5);
    expect(box.maxX).to.equal(80.5);
    expect(box.maxY).to.equal(190.5);
  });

  it('lineWidth', () => {
    expect(polygon.attr('lineWidth')).to.equal(1);
    polygon.attr('lineWidth', 2);
    expect(polygon.attr('lineWidth')).to.equal(2);
    let box = polygon.getBBox();
    expect(box.minX).to.equal(29);
    expect(box.maxX).to.equal(61);
    expect(box.minY).to.equal(19);
    expect(box.maxY).to.equal(101);

    const polygon1 = new G.Polygon({
      attrs: {
        points: [[ 58, 60 ], [ 80, 190 ], [ 32, 53 ], [ 45, 32 ]],
        lineWidth: 2
      }
    });
    box = polygon1.getBBox();
    expect(box.minX).to.equal(31);
    expect(box.minY).to.equal(31);
    expect(box.maxX).to.equal(81);
    expect(box.maxY).to.equal(191);
  });

  it('stroke', () => {
    polygon.attr('stroke', 'l (90) 0:#f0ff0f 1:#ff0e0d');
    expect(polygon.attr('stroke')).to.equal('l (90) 0:#f0ff0f 1:#ff0e0d');
    canvas.add(polygon);
    canvas.draw();
  });

  it('fill', () => {
    polygon.attr('fill', 'r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa');
    expect(polygon.attr('fill')).to.equal('r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa');
    canvas.draw();
  });

  const polygon2 = new G.Polygon({
    attrs: {
      points: [[ 31, 23 ], [ 43, 12 ], [ 53, 23 ], [ 64, 33 ]],
      lineWidth: 2,
      fill: 'r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa'
    }
  });
  canvas.add(polygon2);

  const polygon3 = new G.Polygon({
    attrs: {
      points: [[ 31, 23 ], [ 43, 12 ], [ 53, 23 ], [ 64, 33 ]],
      lineWidth: 2,
      stroke: 'l (90) 0:#f0ff0f 1:#ff0e0d',
      fill: 'r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa'
    }
  });
  canvas.add(polygon3);
});


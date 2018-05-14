/**
 * Created by Elaine on 2018/5/7.
 */
const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-polygon';
document.body.appendChild(div);


describe('Polygon', function() {

  const canvas = new Canvas({
    containerId: 'canvas-polygon',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const polygon = new G.Polygon();
  canvas.add(polygon);
  it('init attr', function() {
    expect(polygon.attr('points')).to.be.undefined;
    expect(polygon.attr('lineWidth')).to.equal(1);
    expect(polygon.attr('stroke')).to.be.undefined;
    expect(polygon.attr('fill')).to.be.equal('none');
  });

  it('points', function() {
    polygon.attr('points', []);
    expect(polygon.attr('points').length).to.equal(0);
    // expect(polygon.getBBox()).to.be.null;
    polygon.attr('points', [[ 30, 30 ], [ 40, 20 ], [ 30, 50 ], [ 60, 100 ]]);
    expect(polygon.attr('points').length).to.equal(4);
    let box = polygon.getBBox();
    expect(box.minX).to.equal(30);
    expect(box.maxX).to.equal(60);
    expect(box.minY).to.equal(20);
    expect(box.maxY).to.equal(100);

    const polygon1 = new G.Polygon({
      attrs: {
        points: [[ 58, 60 ], [ 80, 190 ], [ 32, 53 ], [ 45, 32 ]]
      }
    });
    canvas.add(polygon1);
    box = polygon1.getBBox();
    expect(box.minX).to.equal(32);
    expect(box.minY).to.equal(32);
    expect(box.maxX).to.equal(80);
    expect(box.maxY).to.equal(190);
  });

  it('lineWidth', function() {
    expect(polygon.attr('lineWidth')).to.equal(1);
    polygon.attr('lineWidth', 2);
    expect(polygon.attr('lineWidth')).to.equal(2);
    let box = polygon.getBBox();
    expect(box.minX).to.equal(30);
    expect(box.maxX).to.equal(60);
    expect(box.minY).to.equal(20);
    expect(box.maxY).to.equal(100);

    const polygon1 = new G.Polygon({
      attrs: {
        points: [[ 58, 60 ], [ 80, 190 ], [ 32, 53 ], [ 45, 32 ]],
        lineWidth: 2
      }
    });
    canvas.add(polygon1);
    box = polygon1.getBBox();
    expect(box.minX).to.equal(32);
    expect(box.minY).to.equal(32);
    expect(box.maxX).to.equal(80);
    expect(box.maxY).to.equal(190);
  });

  it('stroke', function() {
    polygon.attr('stroke', 'l (90) 0:#f0ff0f 1:#ff0e0d');
    expect(polygon.attr('stroke')).to.equal('l (90) 0:#f0ff0f 1:#ff0e0d');
    canvas.add(polygon);
    canvas.draw();
  });

  it('fill', function() {
    polygon.attr('fill', 'r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa');
    expect(polygon.attr('fill')).to.equal('r (0.3, 0.2, 0) 0:#edda2f 1:#23edfa');
    canvas.draw();
  });
  const polygon2 = new G.Polygon({
      attrs: {
        points: [[ 31, 23 ], [ 43, 12 ], [ 53, 23 ], [ 64, 33 ]],
        lineWidth: 2,
        fill: 'red'
      }
    });
    canvas.add(polygon2);

    const polygon3 = new G.Polygon({
      attrs: {
        points: [[ 31, 23 ], [ 43, 12 ], [ 53, 23 ], [ 64, 33 ]],
        lineWidth: 2,
        stroke: 'green',
        fill: 'red'
      }
    });
    canvas.add(polygon3);
});


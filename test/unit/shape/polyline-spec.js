const expect = require('chai').expect;
const G = require('../../../src/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-polyline';
document.body.appendChild(div);


describe('Polyline', function() {
  const canvas = new Canvas({
    containerId: 'canvas-polyline',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const polyline = new G.Polyline();

  it('init attrs', function() {
    expect(polyline.attr('points')).to.be.undefined;
    expect(polyline.attr('lineWidth')).to.equal(1);
    expect(polyline.attr('startArrow')).to.be.false;
    expect(polyline.attr('endArrow')).to.be.false;
    const box = polyline.getBBox();
    expect(box).to.be.null;
  });

  it('points', function() {
    polyline.attr('points', []);
    let points = polyline.attr('points');
    expect(points.length).to.equal(0);
    let box = polyline.getBBox();
    expect(box).to.be.null;
    polyline.attr('points', [[ 20, 30 ], [ 50, 40 ], [ 100, 110 ], [ 130, 70 ]]);
    points = polyline.attr('points');
    expect(points.length).to.equal(4);
    box = polyline.getBBox();
    expect(box.minX).to.equal(19.5);
    expect(box.maxX).to.equal(130.5);
    expect(box.minY).to.equal(29.5);
    expect(box.maxY).to.equal(110.5);

    const polyline1 = new G.Polyline({
      attrs: {
        points: [[ 40, 23 ], [ 53, 64 ], [ 79, 120 ], [ 234, 56 ]]
      }
    });
    points = polyline1.attr('points');
    expect(points.length).to.equal(4);
    box = polyline1.getBBox();
    expect(box.minX).to.equal(39.5);
    expect(box.maxX).to.equal(234.5);
    expect(box.minY).to.equal(22.5);
    expect(box.maxY).to.equal(120.5);
  });

  it('lineWidth', function() {
    expect(polyline.attr('lineWidth')).to.equal(1);
    polyline.attr('lineWidth', 2);
    let box = polyline.getBBox();
    expect(box.minX).to.equal(19);
    expect(box.maxX).to.equal(131);
    expect(box.minY).to.equal(29);
    expect(box.maxY).to.equal(111);

    const polyline1 = new G.Polyline({
      attrs: {
        points: [[ 23, 12 ], [ 42, 52 ]],
        lineWidth: 2
      }
    });
    box = polyline1.getBBox();
    expect(box.minX).to.equal(22);
    expect(box.maxX).to.equal(43);
    expect(box.minY).to.equal(11);
    expect(box.maxY).to.equal(53);
  });

  it('stroke', function() {
    polyline.attr('stroke', 'l (0) 0.2:#ff00ff 1:#0000ff');
    expect(polyline.attr('stroke')).to.equal('l (0) 0.2:#ff00ff 1:#0000ff');
    canvas.add(polyline);
    canvas.draw();
  });

  it('isHit', function() {
    expect(polyline.isHit(20, 30)).to.be.true;
    expect(polyline.isHit(35, 35)).to.be.true;
    expect(polyline.isHit(50, 40)).to.be.true;
    expect(polyline.isHit(100, 110)).to.be.true;
    expect(polyline.isHit(130, 70)).to.be.true;
    expect(polyline.isHit(18, 29)).to.be.false;
    const polyline1 = new G.Polyline({
      attrs: {
        points: [[ 10, 10 ]]
      }
    });
    expect(polyline1.isHit(10, 10)).to.be.false;
    polyline1.attr('stroke', 'red');
    expect(polyline1.isHit(10, 10)).to.be.false;
    canvas.add(polyline1);
    canvas.draw();
  });

  it('arrow', function() {
    polyline.attr('startArrow', true);
    expect(polyline.attr('startArrow')).to.be.true;
    canvas.draw();
  });

  it('getPoint', function() {
    expect(polyline.getPoint(1)).to.eql({ x: 130, y: 70 });
    expect(polyline.getPoint(0.5)).to.eql({ x: 80.34077206680482, y: 82.47708089352673 });
    expect(polyline.getPoint(0)).to.eql({ x: 20, y: 30 });
  });
});


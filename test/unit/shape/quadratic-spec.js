const expect = require('chai').expect;
const G = require('../../../src/index');
const Util = require('../../../src/util/index');
const Canvas = require('../../../src/canvas');
const div = document.createElement('div');
div.id = 'canvas-quadratic';
document.body.appendChild(div);


describe('Quadratic line', function() {

  const canvas = new Canvas({
    containerId: 'canvas-quadratic',
    width: 200,
    height: 200,
    pixelRatio: 1
  });

  const quadratic = new G.Quadratic();
  it('init quadratic', function() {
    expect(quadratic.attr('p1')).to.be.undefined;
    expect(quadratic.attr('p2')).to.be.undefined;
    expect(quadratic.attr('p3')).to.be.undefined;
    expect(quadratic.attr('lineWidth')).to.equal(1);
    expect(quadratic.attr('startArrow')).to.be.false;
    expect(quadratic.attr('endArrow')).to.be.false;

    expect(quadratic.getBBox()).to.be.null;
  });

  it('p1, p2, p3', function() {
    quadratic.attr({
      p1: [ 50, 50 ],
      p2: [ 80, 12 ],
      p3: [ 120, 150 ]
    });
    expect(quadratic.attr('p1')[0]).to.equal(50);
    expect(quadratic.attr('p2')[1]).to.equal(12);
    expect(quadratic.attr('p3')[0]).to.equal(120);

    const box = quadratic.getBBox('box');
    expect(Util.isNumberEqual(box.minX, 49.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 120.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 41.29545454545454)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 150.5)).to.be.true;
  });

  it('stroke', function() {
    quadratic.attr('stroke', 'l (0) 0:#ff00ff 1:#00ffff');
    expect(quadratic.attr('stroke')).to.equal('l (0) 0:#ff00ff 1:#00ffff');

    canvas.add(quadratic);
    canvas.draw();
  });

  it('p1', function() {
    quadratic.attr('p1', [ 70, 39 ]);
    expect(quadratic.attr('p1')[0]).to.equal(70);
    expect(quadratic.attr('p1')[1]).to.equal(39);
    const box = quadratic.getBBox();
    expect(Util.isNumberEqual(box.minX, 69.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 120.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 34.081818181818186)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 150.5)).to.be.true;
    canvas.draw();
  });

  it('p2', function() {
    quadratic.attr('p2', [ 90, 80 ]);
    expect(quadratic.attr('p2')[0]).to.equal(90);
    expect(quadratic.attr('p2')[1]).to.equal(80);
    const box = quadratic.getBBox();
    expect(Util.isNumberEqual(box.minX, 69.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 120.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 38.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 150.5)).to.be.true;
    canvas.draw();
  });

  it('p3', function() {
    quadratic.attr('p3', [ 110, 10 ]);
    expect(quadratic.attr('p3')[0]).to.equal(110);
    expect(quadratic.attr('p3')[1]).to.equal(10);
    const box = quadratic.getBBox();
    expect(Util.isNumberEqual(box.minX, 69.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 110.5)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 9.5)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 54.644144144144136)).to.be.true;
    canvas.draw();
  });

  it('lineWidth', function() {
    quadratic.attr('lineWidth', 2);
    expect(quadratic.attr('lineWidth')).to.equal(2);
    const box = quadratic.getBBox();
    expect(Util.isNumberEqual(box.minX, 69)).to.be.true;
    expect(Util.isNumberEqual(box.maxX, 111)).to.be.true;
    expect(Util.isNumberEqual(box.minY, 9)).to.be.true;
    expect(Util.isNumberEqual(box.maxY, 55.144144144144136)).to.be.true;
    canvas.draw();
  });

  it('arrow', function() {
    quadratic.attr('startArrow', true);
    quadratic.attr('endArrow', true);
    // quadratic.attr('arrowLength', 15);
    quadratic.attr('arrowAngle', 45);
    expect(quadratic.attr('startArrow')).to.be.true;
    expect(quadratic.attr('endArrow')).to.be.true;
    expect(quadratic.attr('arrowLength')).to.be.undefined;
    expect(quadratic.attr('arrowAngle')).to.equal(45);
    canvas.draw();
  });


  it('isHit', function() {
    expect(quadratic.isHit(70, 39)).to.be.true;
    expect(quadratic.isHit(90, 52.2)).to.be.true;
    expect(quadratic.isHit(110, 10)).to.be.true;
  });

  it('getPoint', function() {
    const quadratic = new G.Quadratic({
      attrs: {
        p1: [ 100, 100 ],
        p2: [ 200, 200 ],
        p3: [ 300, 100 ]
      }
    });

    const point1 = quadratic.getPoint(0);
    expect(point1.x).to.equal(100);
    expect(point1.y).to.equal(100);
    const point2 = quadratic.getPoint(1);
    expect(point2.x).to.equal(300);
    expect(point2.y).to.equal(100);
    const point3 = quadratic.getPoint(0.5);
    expect(point3.x).to.equal(200);
    expect(point3.y).to.equal(150);
    const point4 = quadratic.getPoint(0.3);
    expect(point4.x).to.equal(160);
    expect(point4.y).to.equal(142);
    expect(quadratic.isHit(160, 142)).to.be.true;
  });
});

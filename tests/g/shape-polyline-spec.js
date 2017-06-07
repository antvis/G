var expect = require('@ali/expect.js');
var G = require('../../src/g/index');
var Util = require('@ali/g-util');
var Canvas = require('../../src/canvas');
var div = document.createElement('div');
div.id = 'canvas-polyline';
document.body.appendChild(div);


describe('Polyline', function() {
  var canvas = new Canvas({
    containerId: 'canvas-polyline',
    width: 200,
    height: 200,
    pixelRatio: 1
  });
  G.debug(true);
  var polyline = new G.Polyline();

  it('init attrs', function() {
    expect(polyline.attr('points')).to.be(undefined);
    expect(polyline.attr('lineWidth')).to.be(1);
    expect(polyline.attr('arrow')).to.be(false);
    var box = polyline.getBBox();
    expect(box).to.be(null);
  });

  it('points', function() {
    polyline.attr('points', []);
    var points = polyline.attr('points');
    expect(points.length).to.be(0);
    var box = polyline.getBBox();
    expect(box).to.be(null);
    polyline.attr('points', [[20, 30], [50, 40], [100, 110], [130, 70]]);
    var points = polyline.attr('points');
    expect(points.length).to.be(4);
    var box = polyline.getBBox();
    expect(box.minX).to.be(19.5);
    expect(box.maxX).to.be(130.5);
    expect(box.minY).to.be(29.5);
    expect(box.maxY).to.be(110.5);

    var polyline1 = new G.Polyline({
      attrs: {
        points: [[40, 23], [53, 64], [79, 120], [234, 56]]
      }
    });
    var points = polyline1.attr('points');
    expect(points.length).to.be(4);
    var box = polyline1.getBBox();
    expect(box.minX).to.be(39.5);
    expect(box.maxX).to.be(234.5);
    expect(box.minY).to.be(22.5);
    expect(box.maxY).to.be(120.5);
  });

  it('lineWidth', function() {
    expect(polyline.attr('lineWidth')).to.be(1);
    polyline.attr('lineWidth', 2);
    var box = polyline.getBBox();
    expect(box.minX).to.be(19);
    expect(box.maxX).to.be(131);
    expect(box.minY).to.be(29);
    expect(box.maxY).to.be(111);

    var polyline1 = new G.Polyline({
      attrs: {
        points: [[23, 12], [42, 52]],
        lineWidth: 2
      }
    });
    var box = polyline1.getBBox();
    expect(box.minX).to.be(22);
    expect(box.maxX).to.be(43);
    expect(box.minY).to.be(11);
    expect(box.maxY).to.be(53);
  });

  it('stroke', function() {
    polyline.attr('stroke', 'l (0) 0.2:#ff00ff 1:#0000ff');
    expect(polyline.attr('stroke')).to.be('l (0) 0.2:#ff00ff 1:#0000ff');
    canvas.add(polyline);
    canvas.draw();
  });

  it('isHit', function() {
    expect(polyline.isHit(20, 30)).to.be(true);
    expect(polyline.isHit(35, 35)).to.be(true);
    expect(polyline.isHit(50, 40)).to.be(true);
    expect(polyline.isHit(100, 110)).to.be(true);
    expect(polyline.isHit(130, 70)).to.be(true);
    expect(polyline.isHit(18, 29)).to.be(false);
    var polyline1 = new G.Polyline({
      attrs: {
        points: [[10, 10]]
      }
    });
    expect(polyline1.isHit(10, 10)).to.be(false);
    polyline1.attr('stroke', 'red');
    expect(polyline1.isHit(10, 10)).to.be(false);
    canvas.add(polyline1);
    canvas.draw();
  });

  it('arrow', function() {
    polyline.attr('arrow', true);
    expect(polyline.attr('arrow')).to.be(true);
    canvas.draw();
  });

  it('getPoint', function() {
    expect(polyline.getPoint(1)).eql({x: 130, y: 70});
    expect(polyline.getPoint(0.5)).eql({x: 80.34077206680482, y: 82.47708089352673});
    expect(polyline.getPoint(0)).eql({x: 20, y: 30});
  });
});









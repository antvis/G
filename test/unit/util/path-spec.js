const expect = require('chai').expect;
const Util = require('../../../src/util/common');
const PathUtil = require('../../../src/util/path');
const Canvas = require('../../../src/index').Canvas;

const dom = document.createElement('div');
document.body.appendChild(dom);

const canvas = new Canvas({
  containerDOM: dom,
  width: 800,
  height: 800
});

function drawPoints(arr, canvas) {
  Util.each(arr, function(v) {
    canvas.addShape('circle', {
      attrs: {
        x: v.x,
        y: v.y,
        r: 5,
        stroke: 'green',
        lineWidth: 2
      }
    });
  });
}

describe('path util test', function() {

  it('path to array', function() {
    const path = 'M 100 100 L 200 200 V 100 H100C 40 10, 65 10, 95 80 S 150 150 180 80Q 95 10 180 80T 180 80L 110 215A 30 50 0 0 1 162.55 162.45L 172.55 152.45A 30 50 -45 0 1 215.1 109.9L 315 10A 45 45, 0, 0, 0, 125 125L 125 80A 45 45, 0, 1, 0, 275 125A 45 45, 0, 0, 1, 125 275A 45 45, 0, 1, 1, 275 275R100 200 50 100 30 40Z';
    expect(PathUtil.parsePathString(path).length).to.equal(20);
  });

  it('arr to path', function() {
    const path = 'M 100 100 L 200 200 V 100 H100C 40 10, 65 10, 95 80 S 150 150 180 80Q 95 10 180 80T 180 80L 110 215A 30 50 0 0 1 162.55 162.45L 172.55 152.45A 30 50 -45 0 1 215.1 109.9L 315 10A 45 45, 0, 0, 0, 125 125L 125 80A 45 45, 0, 1, 0, 275 125A 45 45, 0, 0, 1, 125 275A 45 45, 0, 1, 1, 275 275R100 200 50 100 30 40Z';
    const arr = PathUtil.parsePathString(path);
    const str = PathUtil.parsePathArray(arr);
    expect(str).to.equal('M100,100L200,200V100H100C40,10,65,10,95,80S150,150,180,80Q95,10,180,80T180,80L110,215A30,50,0,0,1,162.55,162.45L172.55,152.45A30,50,-45,0,1,215.1,109.9L315,10A45,45,0,0,0,125,125L125,80A45,45,0,1,0,275,125A45,45,0,0,1,125,275A45,45,0,1,1,275,275R100,200,50,100,30,40Z');
  });

  it('path to absolute', function() {
    const path = 'M 100 100 l 20 20 v 10 c 40 10 20 20 30 30';
    const str = PathUtil.parsePathArray(PathUtil.pathToAbsolute(path));
    expect(str).to.equal('M100,100L120,120V130C160,140,140,150,150,160');
  });
  it('path to RomToBezier', function() {
    const arr = [ 100, 200, 50, 100, 30, 40 ];
    const rst = PathUtil.catmullRomToBezier(arr);
    expect(PathUtil.parsePathArray(rst)).to.equal('C91.66666666666667,183.33333333333334,61.666666666666664,126.66666666666667,50,100C38.333333333333336,73.33333333333333,33.333333333333336,50,30,40');
  });

  it('path to RomToBezier with circle', function() {
    const arr = [ 100, 200, 50, 100, 30, 40 ];
    const rst = PathUtil.catmullRomToBezier(arr, true);
    expect(PathUtil.parsePathArray(rst)).to.equal('C103.33333333333333,210,61.666666666666664,126.66666666666667,50,100C38.333333333333336,73.33333333333333,21.666666666666668,23.333333333333332,30,40C38.333333333333336,56.666666666666664,96.66666666666667,190,100,200');
  });

  it('path Insert', function() {
    const pathStr1 = PathUtil.rectPath(100, 100, 100, 100);
    const pathStr2 = 'M 200 0 L 90 130 M 200 0 L 110 150';
    const rst = PathUtil.intersection(pathStr1, pathStr2);
    canvas.addShape('path', {
      attrs: {
        path: pathStr1,
        stroke: 'red'
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: pathStr2,
        stroke: 'blue'
      }
    });
    drawPoints(rst, canvas);
    canvas.draw();
    console.log(rst);
  });

  it('path Insert', function() {
    const pathStr1 = PathUtil.rectPath(100, 100, 100, 100);
    const pathStr2 = [
      [ 'M', 200, 0 ],
      [ 'C', 200, 0, 200, 150, 150, 150 ],
      [ 'M', 0, 0 ],
      [ 'C', 150, 0, 150, 300, 300, 300 ],
      [ 'M', 0, 150 ],
      [ 'L', 150, 150 ],
      [ 'M', 100, 300 ],
      [ 'L', 220, 100 ],
      [ 'M', 300, 150 ],
      [ 'L', 200, 150 ],
      [ 'M', 300, 200 ],
      [ 'L', 190, 200 ]
    ];
    const rst = PathUtil.intersection(pathStr1, pathStr2);
    canvas.addShape('path', {
      attrs: {
        path: pathStr1,
        stroke: 'red'
      }
    });
    canvas.addShape('path', {
      attrs: {
        path: pathStr2,
        stroke: 'blue'
      }
    });
    drawPoints(rst, canvas);
    canvas.draw();
    console.log(rst);
  });
});


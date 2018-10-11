const expect = require('chai').expect;
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'c1';
document.body.appendChild(div);

describe('#79', () => {
  let canvas = new Canvas({
    containerId: 'c1',
    renderer: 'canvas',
    width: 500,
    height: 500,
    pixelRatio: 2
  });
  canvas.addShape('path', {
    attrs: {
      path: [
        [ 'M', 0, 100 ],
        [ 'L', 500, 100 ]
      ],
      stroke: 'red'
    }
  });
  const cText = canvas.addShape('text', {
    attrs: {
      x: 100,
      y: 100,
      textBaseline: 'top',
      fill: 'black',
      text: '四角的数等于不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列中间数的平均数\n四角的数等于不相邻的两个行列中间数的平均数四角的数等于\n不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列\n中间数的平均数四角的数等于不相邻的两个行列中间数的平\n均数四角的数等于不相邻的两个行列中间数的平均数四角\n的数等于不相邻的两个行列中间数的平均数'
    }
  });
  canvas.draw();
  canvas = new Canvas({
    containerId: 'c1',
    renderer: 'svg',
    width: 500,
    height: 500,
    pixelRatio: 1
  });
  canvas.addShape('path', {
    attrs: {
      path: [
        [ 'M', 0, 100 ],
        [ 'L', 500, 100 ]
      ],
      stroke: 'red'
    }
  });
  const sText = canvas.addShape('text', {
    attrs: {
      x: 100,
      y: 100,
      textBaseline: 'top',
      fill: 'black',
      text: '四角的数等于不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列中间数的平均数\n四角的数等于不相邻的两个行列中间数的平均数四角的数等于\n不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列\n中间数的平均数四角的数等于不相邻的两个行列中间数的平\n均数四角的数等于不相邻的两个行列中间数的平均数四角\n的数等于不相邻的两个行列中间数的平均数'
    }
  });
  canvas.draw();
  it('text baseline', () => {
    const cBBox = cText.getBBox();
    const sBBox = sText.getBBox();
    expect(sBBox.x).to.equal(cBBox.x);
    expect(sBBox.y).to.equal(cBBox.y);
    expect(Math.abs(sBBox.minX - cBBox.minX) < 1);
  });
});

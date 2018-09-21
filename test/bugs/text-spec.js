const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'c1';
document.body.appendChild(div);

describe('#text lineHeight canvas renderer is not same with svg renderer', () => {
  let canvas = new Canvas({
    containerId: 'c1',
    renderer: 'canvas',
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
  canvas.addShape('text', {
    attrs: {
      x: 100,
      y: 100,
      textBaseline: 'top',
      fill: 'black',
      text: '四角的数等于不相邻的两个行列中间数的平均数四\n角的数等于不相邻的两个行列中间数的平均数\n四角的数等于不相邻的两个行列中间数的平均数四角的数等于\n不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列\n中间数的平均数四角的数等于不相邻的两个行列中间数的平\n均数四角的数等于不相邻的两个行列中间数的平均数四角\n的数等于不相邻的两个行列中间数的平均数'
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
  canvas.addShape('text', {
    attrs: {
      x: 100,
      y: 100,
      textBaseline: 'top',
      fill: 'black',
      text: '四角的数等于不相邻的两个行列中间数的平均数四\n角的数等于不相邻的两个行列中间数的平均数\n四角的数等于不相邻的两个行列中间数的平均数四角的数等于\n不相邻的两个行列中间数的平均数四角的数等于不相邻的两个行列\n中间数的平均数四角的数等于不相邻的两个行列中间数的平\n均数四角的数等于不相邻的两个行列中间数的平均数四角\n的数等于不相邻的两个行列中间数的平均数'
    }
  });
  canvas.draw();
});

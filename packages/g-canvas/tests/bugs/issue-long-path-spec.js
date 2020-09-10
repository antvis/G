const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import isPointInPath from '../../src/util/in-path/point-in-path'

const dom = document.createElement('div');
document.body.appendChild(dom);

function cubicAt(p0, p1, p2, p3, t) {
  var onet = 1 - t; // t * t * t 的性能大概是 Math.pow(t, 3) 的三倍
  return onet * onet * onet * p0 + 3 * p1 * t * onet * onet + 3 * p2 * t * t * onet + p3 * t * t * t;
}

describe('long path event', () => {
  it('long path event', () => {
    const canvas = new Canvas({
      container: dom,
      width: 2400,
      height: 2400,
    });
    const group = canvas.addGroup();
    const nodeGroup = group.addGroup();

    const path = nodeGroup.addShape('path', {
      attrs: {
        stroke: '#f00',
        lineWidth: 50,
        lineAppendWidth: 50,
        path: [["M", 120, 200], ["C", 200, -500, 200, -10000, 120, 5420]]
      },
      name: 'path-name'
    });

    canvas.on('path-name:click', e => {
      console.log(e);
    });

    path.on('click', e => {
      console.log('path click', e);
    });

    
  });
});

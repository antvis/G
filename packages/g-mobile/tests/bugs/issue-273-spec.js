const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#273', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('animation should work when interpolate for null matrix', (done) => {
    const circle = canvas.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 100,
        fill: 'red',
        matrix: [1, 0, 0, 0, 1, 0, 20, 20, 1],
      },
    });
    circle.animate(
      {
        matrix: null,
      },
      {
        duration: 100,
      }
    );
    setTimeout(() => {
      // 动画运行过程中，矩阵插值结果不为空数组
      expect(circle.getMatrix()).not.eqls([]);
      done();
    }, 50);
  });
});

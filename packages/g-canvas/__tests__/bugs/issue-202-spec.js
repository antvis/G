const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#202', () => {
  const canvas = new Canvas({
    container: dom,
    width: 500,
    height: 500,
  });

  it.only('the transformation from canvas coordinates to relative coordinates should be effective', (done) => {
    const group = canvas.addGroup();
    const circle = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 40,
        fill: 'red',
      },
    });
    expect(circle.isHit(100, 100)).eqls(true);
    expect(circle.isHit(100, 70)).eqls(true);
    expect(circle.isHit(100, 150)).eqls(false);
    // translate to (100, 120)
    const matrix = [1, 0, 0, 0, 1, 0, 0, 20, 1];
    circle.setMatrix(matrix);
    setTimeout(() => {
      expect(circle.isHit(100, 100)).eqls(true);
      expect(circle.isHit(100, 70)).eqls(false);
      expect(circle.isHit(100, 150)).eqls(true);
      circle.resetMatrix();
      setTimeout(() => {
        expect(circle.isHit(100, 100)).eqls(true);
        expect(circle.isHit(100, 70)).eqls(true);
        expect(circle.isHit(100, 150)).eqls(false);
      }, 25);
      done();
    }, 25);
  });
});

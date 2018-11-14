const expect = require('chai').expect;
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'c1';
document.body.appendChild(div);

const canvas = new Canvas({
  containerId: 'c1',
  renderer: 'svg',
  width: 500,
  height: 500
});

describe('svg shape diff efficiency', () => {
  const group = canvas.addGroup();
  for (let index = 0; index < 300; index++) {
    group.addShape('rect', {
      attrs: {
        x: 500 * Math.random(),
        y: 500 * Math.random(),
        width: 50,
        height: 50,
        fill: 'red',
        stroke: 'blue'
      }
    });
  }
  canvas.draw();
  canvas.on('mousemove', ev => {
    const matrix = group.getMatrix();
    matrix[6] = ev.x - 500;
    matrix[7] = ev.y - 500;
    group.setMatrix(matrix);
    canvas.draw();
  });
  it('attr diff', () => {
    const shape = group._cfg.children[0];
    shape._cfg.el.setAttribute('fill', 'blue');
    group.setMatrix([ 1, 0, 0, 0, 1, 0, 100, 100, 0 ]);
    expect(group._attrs.matrix[6]).to.equal(100);
    expect(group._attrs.matrix[7]).to.equal(100);
    canvas.draw();
    expect(group._cfg.el.getAttribute('transform')).to.equal('matrix(1,0,0,1,100,100)');
    expect(shape._attrs.fill).to.equal('red');
    expect(shape._cfg.el.getAttribute('fill')).to.equal('blue');
  });
});

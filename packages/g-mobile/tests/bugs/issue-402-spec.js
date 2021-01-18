const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#402', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('canvas matrix change should affect totalMatrix of its children', () => {
    const group = canvas.addGroup();
    const shape = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
      },
    });
    canvas.setMatrix([1, 0, 0, 0, 1, 0, 50, 50, 1]);
    group.setMatrix([1, 0, 0, 0, 1, 0, 20, 20, 1]);
    shape.setMatrix([2, 0, 0, 0, 2, 0, 0, 0, 1]);
    expect(group.getTotalMatrix()).eqls([1, 0, 0, 0, 1, 0, 70, 70, 1]);
    expect(shape.getTotalMatrix()).eqls([2, 0, 0, 0, 2, 0, 70, 70, 1]);
  });
});

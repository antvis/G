const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#407', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('bbox for container should not contain Infinity and -Infinity', () => {
    // case 1: child is a empty group
    const group1 = canvas.addGroup();
    group1.addGroup();

    expect(group1.getBBox()).eqls({
      x: 0,
      y: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
    });

    // case 2: child's visible is false
    const group2 = canvas.addGroup();
    group2.addShape('circle', {
      visible: false,
      attrs: {
        x: 100,
        y: 100,
        r: 50,
        lineWidth: 5,
        fill: 'red',
        stroke: 'blue',
      },
    });

    expect(group2.getBBox()).eqls({
      x: 0,
      y: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
    });
  });
});

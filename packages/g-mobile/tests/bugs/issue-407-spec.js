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

  it('bbox calculation should be correct for container', () => {
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

    // case 2: all child's visible are false
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

    // case 3: not all child's visible are false
    const group3 = canvas.addGroup();
    group3.addShape('rect', {
      visible: false,
      attrs: {
        x: 50,
        y: 50,
        width: 60,
        height: 60,
        fill: 'red',
      },
    });
    group3.addShape('rect', {
      attrs: {
        x: 100,
        y: 100,
        width: 10,
        height: 10,
        fill: 'red',
      },
    });
    expect(group3.getBBox()).eqls({
      x: 100,
      y: 100,
      minX: 100,
      minY: 100,
      maxX: 110,
      maxY: 110,
      width: 10,
      height: 10,
    });

    // case 4: a child is empty group and another child is not
    const group = canvas.addGroup();
    const subGroup1 = group.addGroup();
    const subGroup2 = group.addGroup();

    subGroup2.attr('matrix', [1, 0, 0, 0, 1, 0, 100, 100, 1]);

    subGroup2.addShape('rect', {
      attrs: {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 1,
        height: 100,
        width: 150,
        x: -75,
        y: -50,
      },
    });

    expect(subGroup1.getBBox()).eqls({
      x: 0,
      y: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
    });
    expect(subGroup2.getBBox()).eqls({
      x: -75.5,
      y: -50.5,
      minX: -75.5,
      minY: -50.5,
      maxX: 75.5,
      maxY: 50.5,
      width: 151,
      height: 101,
    });
    expect(group.getBBox()).eqls({
      x: -75.5,
      y: -50.5,
      minX: -75.5,
      minY: -50.5,
      maxX: 75.5,
      maxY: 50.5,
      width: 151,
      height: 101,
    });
    expect(group.getCanvasBBox()).eqls({
      x: 24.5,
      y: 49.5,
      minX: 24.5,
      minY: 49.5,
      maxX: 175.5,
      maxY: 150.5,
      width: 151,
      height: 101,
    });
  });
});

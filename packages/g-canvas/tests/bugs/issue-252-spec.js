const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#252', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  // 规则形状水平和垂直方向没有凸起角
  it('bbox calculation for path with regular angle should be correct', () => {
    const shape = canvas.addShape({
      type: 'path',
      attrs: {
        lineWidth: 2,
        path: [
          ['M', 75, 200],
          ['L', 75, 100],
          ['L', 175, 100],
          ['L', 175, 200],
          ['L', 75, 200],
        ],
        stroke: 'red',
      },
    });

    const bbox = shape.getBBox();
    expect(bbox.minX).eqls(74);
    expect(bbox.minY).eqls(99);
    expect(bbox.maxX).eqls(176);
    expect(bbox.maxY).eqls(201);
  });

  // 水平和垂直方向具有凸起角
  it('bbox calculation for path with prominent angle should be correct', () => {
    const shape = canvas.addShape({
      type: 'path',
      attrs: {
        lineWidth: 2,
        path: [['M', 100, 100], ['L', 200, 200], ['L', 100, 300], ['L', 0, 200], ['Z']],
        stroke: 'red',
      },
    });

    const bbox = shape.getBBox();
    expect(bbox.minX).eqls(-1.4142135623730951);
    expect(bbox.minY).eqls(98.58578643762691);
    expect(bbox.maxX).eqls(201.4142135623731);
    expect(bbox.maxY).eqls(301.4142135623731);
  });
});

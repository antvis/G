const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#206', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
    localRefresh: true, // 由于局部刷新依赖于图形的包围盒计算，因此测试时 localRefresh 需要为 true
  });

  it('bbox calculation should be correct for path with arc', () => {
    const shape1 = canvas.addShape('path', {
      attrs: {
        fill: '#1890ff',
        lineWidth: 0,
        path: [
          ['M', 227.31794680557064, 200.00000266808433],
          ['L', 87.61525298763183, 98.50004569833794],
          ['A', 172.6820363488079, 172.6820363488079, 0, 0, 0, 63.08757910043951, 253.36168385505405],
          ['L', 227.31794680557064, 200.00000266808433],
          ['Z'],
        ],
      },
    });
    const shape2 = canvas.addShape('path', {
      attrs: {
        fill: '#5D7092',
        fillOpacity: 0.85,
        lineWidth: 0,
        path: [
          ['M', 227.31796092753956, 200.00000629398966],
          ['L', 63.08757910043951, 253.36168385505405],
          ['A', 172.68203634880794, 172.68203634880794, 0, 0, 0, 345.526943245539, 325.8797870175248],
          ['L', 227.31796092753956, 200.00000629398966],
          ['z'],
        ],
      },
    });
    const bbox1 = shape1.getBBox();
    const bbox2 = shape2.getBBox();
    expect(bbox1.minX).eqls(54.63591866828193);
    expect(bbox1.minY).eqls(98.50004569833794);
    expect(bbox1.maxX).eqls(227.31794680557064);
    expect(bbox1.maxY).eqls(253.36168385505414);
    expect(bbox2.minX).eqls(63.087579100439484);
    expect(bbox2.minY).eqls(200.00000629398966);
    expect(bbox2.maxX).eqls(345.526943245539);
    expect(bbox2.maxY).eqls(372.68203634880797);
  });
});

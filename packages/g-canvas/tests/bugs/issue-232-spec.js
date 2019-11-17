const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#232', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 800,
  });

  it('bbox calculation should be correct for path with angle', (done) => {
    const shape = canvas.addShape('path', {
      attrs: {
        path: [
          ['M', 73.82280392116971, 388],
          ['L', 112.19659169514973, 349.2],
          ['L', 150.57037946912976, 368.6],
          ['M', 227.31795501708984, 116.40000000000003],
          ['L', 265.6917427910699, 271.6],
          ['L', 304.0655305650499, 27.159999999999968],
          ['L', 342.4393183390299, 155.20000000000002],
          ['L', 380.81310611300995, 0],
        ],
        stroke: '#1890ff',
        lineWidth: 2,
      },
    });
    let bbox = shape.getBBox();
    expect(bbox.minX).eqls(72.82280392116971);
    expect(bbox.minY).eqls(-1);
    expect(bbox.maxX).eqls(381.8131061130099);
    expect(bbox.maxY).eqls(389);
    shape.animate(
      {
        path: [
          ['M', 73.82280392116971, 337.56],
          ['L', 112.19659169514973, 256.08],
          ['L', 150.57037946912976, 368.6],
          ['L', 188.9441672431098, 256.08],
          ['L', 227.31795501708984, 310.4],
          ['L', 265.6917427910699, 360.84],
          ['L', 304.0655305650499, 298.76],
          ['L', 342.4393183390299, 38.80000000000001],
          ['L', 388.81310611300995, 376.36],
        ],
      },
      {
        duration: 500,
      }
    );
    setTimeout(() => {
      bbox = shape.getBBox();
      expect(bbox.minX).eqls(72.82280392116971);
      expect(bbox.minY).eqls(31.487390015101695);
      expect(bbox.maxX).eqls(386.8131061130099);
      expect(bbox.maxY).eqls(377.36);
      done();
    }, 600);
  });
});

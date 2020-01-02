const expect = require('chai').expect;
const Canvas = require('../../src/canvas');

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.transform = 'scale(0.8, 0.8)';

describe('#333', () => {
  const canvas = new Canvas({
    containerId: 'c1',
    width: 600,
    height: 600
  });

  it('canvas.getPointByClient() should calculate correctly when container has CSS transform', () => {
    const group = canvas.addGroup();
    const circle = group.addShape('circle', {
      attrs: {
        x: 100,
        y: 100,
        r: 100,
        fill: 'red'
      }
    });

    canvas.draw();

    const { x: clientX } = canvas.getPointByClient(400, 400);
    // 这里只判断 clientX 的值即可，因为 clientY 在 interactive 测试模式下，测试信息会占据一部分高度，导致和 renderer 模式下测试结果不一致的情况
    expect(clientX).eqls(640);

    circle.on('mouseenter', () => {
      circle.attr('fill', 'blue');
      canvas.draw();
    });

    circle.on('mouseleave', () => {
      circle.attr('fill', 'red');
      canvas.draw();
    });
  });
});

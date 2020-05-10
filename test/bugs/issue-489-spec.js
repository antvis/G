const Canvas = require('../../src/canvas');

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';
dom.style.border = '1px solid red';
dom.style.transform = 'translate(100px, 100px) scale(1.2) rotate3d(1, 1, 1, 45deg)';

describe('#489', () => {
  const canvas = new Canvas({
    containerId: 'c1',
    width: 400,
    height: 400,
    supportCSSTransform: true
  });

  it('event should work when CSS transform is applied', () => {
    const group = canvas.addGroup();
    const circle = group.addShape('rect', {
      attrs: {
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        fill: 'red'
      }
    });

    canvas.draw();

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

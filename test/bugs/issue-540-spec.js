const G = require('../../src/index');

const div = document.createElement('div');
div.id = '540';
document.body.appendChild(div);

describe('#540', () => {
  it('should work for Path when path attr length is 1', () => {
    const canvas = new G.Canvas({
      containerId: '540',
      width: 500,
      height: 500
    });
    canvas.addShape('path', {
      attrs: {
        stroke: '#1890FF',
        path: [[ 'M', 1138.75, 312 ]]
      }
    });
    canvas.draw();
    // TODO: 判断控制台是否抛错
  });
});


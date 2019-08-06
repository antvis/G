const expect = require('chai').expect;
const G = require('../../src/index');
const Canvas = G.Canvas;

const div = document.createElement('div');
div.id = 'text-height';
document.body.appendChild(div);

describe('#text height update', () => {
  const canvas = new Canvas({
    containerId: div.id,
    renderer: 'canvas',
    width: 500,
    height: 500,
    pixelRatio: 1
  });

  it('change mutil-line text to single line text', function() {
    const lineWidth = 1;
    const text = new G.Text({
      attrs: {
        x: 50,
        y: 50,
        lineHeight: 14,
        fontSize: 14,
        lineWidth,
        text: '你好啊\n你好啊\n你好啊'
      }
    });
    canvas.add(text);
    canvas.draw();
    const mulBox = text.getBBox();
    text.attr('text', '你好啊');
    const singleBox = text.getBBox();
    expect(mulBox.width).to.equal(singleBox.width);
    expect((mulBox.height - lineWidth) / 3).to.equal(singleBox.height - lineWidth);
  });
});


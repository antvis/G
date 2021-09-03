const expect = require('chai').expect;
import Canvas from '../../src/abstract/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'abc';

const canvasRender = document.createElement('canvas');
canvasRender.id = 'customCanvas';

describe('#794', () => {
  it('should set canvas element', () => {
    const canvas = new Canvas({
      container: dom,
      width: 400,
      height: 400,
      renderElement: canvasRender,
    });

    expect(canvas.get('el')).equal(canvasRender);
  });
});

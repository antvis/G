const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#359', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('clip animation should work', () => {
    const group = canvas.addGroup();
    group.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 50,
        height: 150,
        fill: 'red',
      },
    });

    const clipShape = group.setClip({
      type: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: 60,
        height: 0,
      },
    });

    // clip animation should work
    clipShape.animate(
      {
        height: 160,
      },
      {
        duration: 10000,
      }
    );

    const el = clipShape.get('el');
    expect(el.parentNode).not.eqls(undefined);
    expect(el.parentNode.nodeName).eqls('clipPath');
  });
});

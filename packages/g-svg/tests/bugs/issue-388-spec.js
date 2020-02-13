const expect = require('chai').expect;
import Canvas from '../../../g-svg/src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#388', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('remove for clipShape should work', (done) => {
    const group = canvas.addGroup();
    group.addShape({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 50,
        height: 150,
        fill: 'rgba(220, 0, 150, .5)',
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

    clipShape.animate(
      {
        height: 160,
      },
      {
        duration: 500,
        easing: 'easeQuadOut',
        callback: () => {
          group.setClip(null);
        },
      }
    );
    setTimeout(() => {
      const groupEl = group.get('el');
      const clipShapeEl = clipShape.get('el');
      expect(groupEl.getAttribute('clip-path')).eqls(null);
      expect(clipShapeEl).not.eqls(undefined);
      done();
    }, 600);
  });
});

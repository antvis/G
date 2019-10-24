const expect = require('chai').expect;
import Canvas from '../../src/canvas';
import { getColor } from '../get-color';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#218', () => {
  const canvas = new Canvas({
    container: dom,
    pixelRatio: 1,
    width: 500,
    height: 500,
  });
  const context = canvas.get('context');

  it('the animation of clip shape should be effective', (done) => {
    const group = canvas.addGroup();
    const shape = group.addShape('rect', {
      attrs: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      },
    });
    const clipShape = shape.setClip({
      type: 'circle',
      attrs: {
        x: 150,
        y: 150,
        r: 20,
      },
    });
    clipShape.animate(
      {
        r: 50,
      },
      {
        duration: 500,
      }
    );
    setTimeout(() => {
      expect(getColor(context, 150, 150)).eqls('#ff0000');
      expect(getColor(context, 150, 160)).eqls('#ff0000');
      expect(getColor(context, 150, 190)).eqls('#000000');
      setTimeout(() => {
        expect(getColor(context, 150, 150)).eqls('#ff0000');
        expect(getColor(context, 150, 160)).eqls('#ff0000');
        expect(getColor(context, 150, 190)).eqls('#ff0000');
        shape.setClip(null);
        expect(clipShape.get('destroyed')).eqls(true);
        done();
      }, 600);
    }, 25);
  });
});

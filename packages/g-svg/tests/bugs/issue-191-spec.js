import { expect } from 'chai';
import getCanvas from '../get-canvas';

describe('#191', () => {
  let canvas;
  let circle;

  before(() => {
    canvas = getCanvas('svg-circle');
    circle = canvas.addShape('circle', {
      attrs: {
        x: 20,
        y: 20,
        r: 20,
        fill: 'red',
      },
    });
  });

  it('autoDraw should be true and immutable', () => {
    expect(canvas.get('autoDraw')).eqls(true);
    canvas.set('autoDraw', false);
    expect(canvas.get('autoDraw')).eqls(true);
  });

  it('avoid redundant rendering when animating', (done) => {
    circle.animate(
      {
        r: 40,
      },
      {
        duration: 200,
        repeat: true,
      }
    );
    setTimeout(() => {
      const count = document.getElementsByTagName('circle').length;
      expect(count).eqls(1);
      done();
    }, 1000);
  });
});

const expect = require('chai').expect;
import Canvas from '../../src/canvas';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('#342', () => {
  const canvas = new Canvas({
    container: dom,
    width: 600,
    height: 600,
  });

  it('opacity attr for shape should be 1 by default', () => {
    const rect = canvas.addShape('rect', {
      attrs: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      },
    });
    expect(rect.attr('opacity')).eqls(1);
    rect.attr('opacity', 0.8);
    expect(rect.attr('opacity')).eqls(0.8);
  });
});

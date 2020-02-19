const expect = require('chai').expect;
import { Canvas } from '../../../src/index';

const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('Arrow defs', () => {
  const canvas = new Canvas({
    container: dom,
    width: 400,
    height: 400,
  });

  it('should not create marker defs dom when startArrow or endArrow is false', () => {
    const line = canvas.addShape('line', {
      attrs: {
        x1: 20,
        y1: 20,
        x2: 50,
        y2: 50,
        stroke: 'red',
        startArrow: false,
        endArrow: false,
      },
    });
    const el = line.get('el');
    const markerNodes = document.getElementsByTagName('marker');
    expect(el.getAttribute('marker-start')).eqls(null);
    expect(el.getAttribute('marker-end')).eqls(null);
    expect(markerNodes.length).eqls(0);
  });
});

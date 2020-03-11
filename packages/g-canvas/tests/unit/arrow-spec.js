// import { expect } from 'chai';
// import * as Shape from '../../src/shape';
import Canvas from '../../src/canvas';
const dom = document.createElement('div');
document.body.appendChild(dom);
dom.id = 'c1';

describe('arrow bbox', () => {
  it('arrow cacl bbox', () => {
    const canvas = new Canvas({
      container: dom,
      width: 500,
      pixelRatio: 2,
      height: 500,
    });

    const group = canvas.addGroup();
    const lineShape = group.addShape('line', {
      attrs: {
        x1: 10,
        y1: 10,
        x2: 50,
        y2: 100,
        stroke: 'red',
        lineWidth: 3,
        endArrow: true,
      },
    });

    lineShape.getCanvasBBox();

    canvas.draw();
  });
});

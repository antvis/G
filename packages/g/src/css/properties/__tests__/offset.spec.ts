import chai, { expect } from 'chai';
import { Circle, Line, CSS, Canvas, CSSUnitValue } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../../__tests__/utils';
import { vec3 } from 'gl-matrix';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();
const canvas = new Canvas({
  container: 'container',
  width: 100,
  height: 100,
  renderer,
});

/**
 * <offset-distance>
 */
describe('CSSPropertyOffsetDistance', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should parse offset distance correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
        offsetDistance: 0,
        offsetPath: new Line({
          style: {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 100,
          },
        }),
      },
    });

    canvas.appendChild(circle);

    await sleep(100);

    // attribute
    expect(circle.getAttribute('offsetDistance')).to.be.eqls(0);

    // used value
    let used = circle.computedStyleMap().get('offsetDistance') as CSSUnitValue;
    expect(used.equals(CSS.number(0))).to.be.true;
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(0, 0, 0));

    circle.style.offsetDistance = 1;
    used = circle.computedStyleMap().get('offsetDistance') as CSSUnitValue;
    expect(used.equals(CSS.number(1))).to.be.true;
    expect(circle.getLocalPosition()).to.be.eqls(vec3.fromValues(100, 100, 0));
  });
});

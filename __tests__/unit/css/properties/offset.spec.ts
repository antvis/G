import { Renderer as CanvasRenderer } from '../../../../packages/g-svg/src';
import {
  Canvas,
  Circle,
  CSS,
  CSSUnitValue,
  Line,
} from '../../../../packages/g/src';

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
    canvas.destroyChildren();
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

    await canvas.ready;
    canvas.appendChild(circle);

    // attribute
    expect(circle.getAttribute('offsetDistance')).toBe(0);

    // used value
    // let used = circle.computedStyleMap().get('offsetDistance') as CSSUnitValue;
    // expect(used.equals(CSS.number(0))).toBeTruthy();
    expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);

    circle.style.offsetDistance = 1;
    // used = circle.computedStyleMap().get('offsetDistance') as CSSUnitValue;
    // expect(used.equals(CSS.number(1))).toBeTruthy();
    expect(circle.getLocalPosition()).toStrictEqual([100, 100, 0]);
  });
});

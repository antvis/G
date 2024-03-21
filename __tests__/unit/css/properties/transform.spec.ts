import { Renderer as CanvasRenderer } from '../../../../packages/g-svg/src';
import {
  Canvas,
  Circle,
  CSS,
  ParsedTransform,
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
 * <transform>
 */
describe('CSSPropertyTransform', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  // it('should parse transform correctly.', async () => {
  //   const circle = new Circle({
  //     style: {
  //       cx: 10,
  //       cy: 10,
  //       r: 50,
  //       transform: 'translate(10, 10)',
  //     },
  //   });

  //   await canvas.ready;
  //   canvas.appendChild(circle);

  //   // attribute
  //   expect(circle.getAttribute('transform')).toBe('translate(10, 10)');

  //   // used value
  //   let used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('translate');
  //   expect(used[0].d.length).toBe(2);
  //   expect(used[0].d[0].equals(CSS.px(10))).toBeTruthy();
  //   expect(used[0].d[1].equals(CSS.px(10))).toBeTruthy();
  //   expect(circle.getLocalPosition()).toStrictEqual([10, 10, 0]);

  //   // translateX
  //   circle.style.transform = 'translateX(20)';
  //   expect(circle.getLocalPosition()).toStrictEqual([20, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('translatex');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.px(20))).toBeTruthy();

  //   // translateY
  //   circle.style.transform = 'translateY(20)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 20, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('translatey');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.px(20))).toBeTruthy();

  //   // translateZ
  //   circle.style.transform = 'translateZ(20)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 20]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('translatez');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.px(20))).toBeTruthy();

  //   // translate3d
  //   circle.style.transform = 'translate3d(10, 10px, 10px)';
  //   expect(circle.getLocalPosition()).toStrictEqual([10, 10, 10]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('translate3d');
  //   expect(used[0].d.length).toBe(3);
  //   expect(used[0].d[0].equals(CSS.px(10))).toBeTruthy();
  //   expect(used[0].d[1].equals(CSS.px(10))).toBeTruthy();
  //   expect(used[0].d[2].equals(CSS.px(10))).toBeTruthy();

  //   // scaleX
  //   circle.style.transform = 'scaleX(2)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scalex');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();

  //   // scaleY
  //   circle.style.transform = 'scaleY(2)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scaley');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();

  //   // scaleZ
  //   circle.style.transform = 'scaleZ(2)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scalez');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();

  //   // scale3d
  //   circle.style.transform = 'scale3d(2,2,2)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scale3d');
  //   expect(used[0].d.length).toBe(3);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();
  //   expect(used[0].d[1].equals(CSS.number(2))).toBeTruthy();
  //   expect(used[0].d[2].equals(CSS.number(2))).toBeTruthy();

  //   // scale
  //   circle.style.transform = 'scale(2)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scale');
  //   expect(used[0].d.length).toBe(2);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();
  //   expect(used[0].d[1].equals(CSS.number(2))).toBeTruthy();

  //   // scale
  //   circle.style.transform = 'scale(2,3)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('scale');
  //   expect(used[0].d.length).toBe(2);
  //   expect(used[0].d[0].equals(CSS.number(2))).toBeTruthy();
  //   expect(used[0].d[1].equals(CSS.number(3))).toBeTruthy();

  //   // rotate
  //   circle.style.transform = 'rotate(30deg)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotate');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.deg(30))).toBeTruthy();

  //   // rotate
  //   circle.style.transform = 'rotate(1rad)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotate');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.rad(1))).toBeTruthy();

  //   // rotate
  //   circle.style.transform = 'rotate(1turn)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotate');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.turn(1))).toBeTruthy();

  //   // rotate
  //   circle.style.transform = 'rotate(1grad)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotate');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.grad(1))).toBeTruthy();

  //   // rotateX
  //   circle.style.transform = 'rotateX(30deg)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotatex');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.deg(30))).toBeTruthy();

  //   // rotateY
  //   circle.style.transform = 'rotateY(30deg)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotatey');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.deg(30))).toBeTruthy();

  //   // rotateZ
  //   circle.style.transform = 'rotateZ(30deg)';
  //   expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
  //   used = circle.computedStyleMap().get('transform') as ParsedTransform[];
  //   expect(used.length).toBe(1);
  //   expect(used[0].t).toBe('rotatez');
  //   expect(used[0].d.length).toBe(1);
  //   expect(used[0].d[0].equals(CSS.deg(30))).toBeTruthy();
  // });

  it('should apply a series of transforms correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
        transform: 'translate(10, 10) scale(0.5) translate(-10, -10)',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    expect(circle.getLocalPosition()).toStrictEqual([5, 5, 0]);
    expect(circle.getLocalBounds().center).toStrictEqual([10, 10, 0]);
    expect(circle.getLocalBounds().halfExtents).toStrictEqual([25, 25, 0]);
  });

  it("should reset transform with 'none' keyword correctly.", async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
        transform: 'translate(10, 10)',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    expect(circle.getLocalPosition()).toStrictEqual([10, 10, 0]);
    expect(circle.getLocalBounds().center).toStrictEqual([20, 20, 0]);
    expect(circle.getLocalBounds().halfExtents).toStrictEqual([50, 50, 0]);

    circle.style.transform = 'none';
    expect(circle.getLocalPosition()).toStrictEqual([0, 0, 0]);
    expect(circle.getLocalBounds().center).toStrictEqual([10, 10, 0]);
    expect(circle.getLocalBounds().halfExtents).toStrictEqual([50, 50, 0]);
  });
});

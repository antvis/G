import { Renderer as CanvasRenderer } from '../../../../packages/g-svg/src';
import { Canvas, Circle, CSS, CSSUnitValue } from '../../../../packages/g/src';
import { sleep } from '../../utils';

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
 * <length> & <percentage>
 */
describe('CSSPropertyLengthOrPercentage', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should parse length & percentage correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 50,
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    // attribute
    expect(circle.getAttribute('cx')).toBe(10);
    expect(circle.getAttribute('cy')).toBe(10);
    expect(circle.getAttribute('r')).toBe(50);

    // computed value
    // let computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(10))).toBeTruthy();

    circle.style.cx = 30;
    expect(circle.getAttribute('cx')).toBe(30);
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(30))).toBeTruthy();

    circle.style.cx = '20px';
    expect(circle.getAttribute('cx')).toBe('20px');
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(20))).toBeTruthy();

    circle.style.cx = '50%';
    expect(circle.getAttribute('cx')).toBe('50%');
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.percent(50))).toBeTruthy();

    circle.style.cx = '0';
    expect(circle.getAttribute('cx')).toBe('0');
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(0))).toBeTruthy();

    circle.style.cx = '0.2px';
    expect(circle.getAttribute('cx')).toBe('0.2px');
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(0.2))).toBeTruthy();

    circle.style.cx = undefined;
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.equals(CSS.px(0.2))).toBeTruthy();

    circle.style.cx = null;
    expect(circle.getAttribute('cx')).toBeNull();
    // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // expect(computed.toString()).toBe('unset');
    expect(circle.parsedStyle.cx).toBeNull();

    circle.animate(
      [
        {
          cx: '0',
        },
        { cx: '20px' },
      ],
      { duration: 100, fill: 'both' },
    );

    await sleep(1000);
    expect(circle.getAttribute('cx')).toBe('20px');

    // // em
    // circle.style.cx = '1em';
    // expect(circle.getAttribute('cx')).toBe('1em');
    // // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // // expect(computed.equals(CSS.em(1))).toBeTruthy();
    // expect(circle.parsedStyle.cx).toBe(16);

    // // rem
    // circle.style.cx = '2rem';
    // expect(circle.getAttribute('cx')).toBe('2rem');
    // // computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    // // expect(computed.equals(CSS.rem(2))).toBeTruthy();
    // expect(circle.parsedStyle.cx).toBe(32);
  });
});

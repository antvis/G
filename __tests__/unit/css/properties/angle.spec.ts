import { Renderer as CanvasRenderer } from '../../../../packages/g-svg/src';
import {
  Canvas,
  CSS,
  CSSUnitValue,
  CustomElement,
  DisplayObjectConfig,
  PropertySyntax,
} from '../../../../packages/g/src';
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

interface AProps {
  angle?: string | number | null;
  test: number;
}

/**
 * <angle>
 */
describe('CSSPropertyAngle', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it.skip('should parse angle correctly.', async () => {
    // register angle
    CSS.registerProperty({
      name: 'angle',
      syntax: PropertySyntax.ANGLE,
      initialValue: '0',
      interpolable: true,
    });

    class ElementA extends CustomElement<AProps> {
      constructor(options: Partial<DisplayObjectConfig<AProps>>) {
        super(options);
      }
      connectedCallback() {}
      disconnectedCallback() {}
      attributeChangedCallback<Key extends never>(
        name: Key,
        oldValue: any,
        newValue: any,
      ) {}
    }

    const circle = new ElementA({
      style: {
        angle: '30deg',
        test: 50,
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    // attribute
    expect(circle.getAttribute('angle')).toBe('30deg');
    expect(circle.getAttribute('test')).toBe(50);
    // computed value
    // let computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.deg(30))).toBeTruthy();
    // expect(circle.computedStyleMap().get('test')).toBe(50);
    // used value
    expect(circle.parsedStyle.angle).toBe(30);
    expect(circle.parsedStyle.test).toBe(50);

    // 90deg
    circle.style.angle = 90;
    expect(circle.getAttribute('angle')).toBe(90);
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.deg(90))).toBeTruthy();
    expect(circle.parsedStyle.angle).toBe(90);

    // 60deg
    circle.style.angle = '60deg';
    expect(circle.getAttribute('angle')).toBe('60deg');
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.deg(60))).toBeTruthy();
    expect(circle.parsedStyle.angle).toBe(60);

    // 2rad
    circle.style.angle = '2rad';
    expect(circle.getAttribute('angle')).toBe('2rad');
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.rad(2))).toBeTruthy();
    // expect(circle.parsedStyle.angle).toBe(CSS.deg(360));

    // 1turn
    circle.style.angle = '1turn';
    expect(circle.getAttribute('angle')).toBe('1turn');
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.turn(1))).toBeTruthy();
    expect(circle.parsedStyle.angle).toBe(360);

    // should remain the same
    circle.style.angle = undefined;
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.turn(1))).toBeTruthy();
    expect(circle.parsedStyle.angle).toBe(360);

    // unset
    circle.style.angle = null;
    expect(circle.getAttribute('angle')).toBeNull();
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.toString()).toBe('unset');
    expect(circle.parsedStyle.angle).toBe(0);

    // start animation
    circle.animate(
      [
        {
          angle: '0',
        },
        { angle: '40deg' },
      ],
      { duration: 100, fill: 'both' },
    );

    await sleep(1000);

    // after animation
    expect(circle.getAttribute('angle')).toBe('40deg');
    // computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    // expect(computed.equals(CSS.deg(40))).toBeTruthy();
    expect(circle.parsedStyle.angle).toBe(40);
  });
});

import {
  BaseCustomElementStyleProps,
  Canvas,
  CSS,
  CSSUnitValue,
  CustomElement,
  DisplayObjectConfig,
  PropertySyntax,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { expect } from 'chai';
import { sleep } from '../../../__tests__/utils';

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

interface AProps extends BaseCustomElementStyleProps {
  angle: string | number;
  test: number;
}

/**
 * <angle>
 */
describe('CSSPropertyAngle', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should parse angle correctly.', async () => {
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
        oldValue: {}[Key],
        newValue: {}[Key],
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
    expect(circle.getAttribute('angle')).to.be.eqls('30deg');
    expect(circle.getAttribute('test')).to.be.eqls(50);
    // computed value
    let computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.deg(30))).to.be.true;
    expect(circle.computedStyleMap().get('test')).to.be.eqls(50);
    // used value
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(30));
    expect(circle.parsedStyle.test).to.be.eqls(50);

    // 90deg
    circle.style.angle = 90;
    expect(circle.getAttribute('angle')).to.be.eqls(90);
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.deg(90))).to.be.true;
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(90));

    // 60deg
    circle.style.angle = '60deg';
    expect(circle.getAttribute('angle')).to.be.eqls('60deg');
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.deg(60))).to.be.true;
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(60));

    // 2rad
    circle.style.angle = '2rad';
    expect(circle.getAttribute('angle')).to.be.eqls('2rad');
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.rad(2))).to.be.true;
    // expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(360));

    // 1turn
    circle.style.angle = '1turn';
    expect(circle.getAttribute('angle')).to.be.eqls('1turn');
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.turn(1))).to.be.true;
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(360));

    // should remain the same
    circle.style.angle = undefined;
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.turn(1))).to.be.true;
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(360));

    // unset
    circle.style.angle = null;
    expect(circle.getAttribute('angle')).to.be.null;
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.toString()).to.be.eqls('unset');
    expect(circle.parsedStyle.angle.equals(CSS.deg(0))).to.be.true;

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

    await sleep(500);

    // after animation
    expect(circle.getAttribute('angle')).to.be.eqls('40deg');
    computed = circle.computedStyleMap().get('angle') as CSSUnitValue;
    expect(computed.equals(CSS.deg(40))).to.be.true;
    expect(circle.parsedStyle.angle).to.be.eqls(CSS.deg(40));
  });
});

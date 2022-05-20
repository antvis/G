import chai, { expect } from 'chai';
import { Circle, CSS, Canvas, CSSUnitValue } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
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

/**
 * <length> & <percentage>
 */
describe('CSSPropertyLengthOrPercentage', () => {
  afterEach(() => {
    canvas.removeChildren();
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

    canvas.appendChild(circle);

    await sleep(100);

    // attribute
    expect(circle.getAttribute('cx')).to.be.eqls(10);
    expect(circle.getAttribute('cy')).to.be.eqls(10);
    expect(circle.getAttribute('r')).to.be.eqls(50);

    // computed value
    let computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.px(10))).to.be.true;

    circle.style.cx = '20px';
    expect(circle.getAttribute('cx')).to.be.eqls('20px');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.px(20))).to.be.true;

    circle.style.cx = '50%';
    expect(circle.getAttribute('cx')).to.be.eqls('50%');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.percent(50))).to.be.true;

    circle.style.cx = '0';
    expect(circle.getAttribute('cx')).to.be.eqls('0');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.px(0))).to.be.true;

    circle.style.cx = '0.2px';
    expect(circle.getAttribute('cx')).to.be.eqls('0.2px');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.px(0.2))).to.be.true;

    circle.style.cx = undefined;
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.px(0.2))).to.be.true;

    circle.style.cx = null;
    expect(circle.getAttribute('cx')).to.be.null;
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.toString()).to.be.eqls('unset');
    expect(circle.parsedStyle.cx.equals(CSS.px(0))).to.be.true;

    circle.animate(
      [
        {
          cx: '0',
        },
        { cx: '20px' },
      ],
      { duration: 100, fill: 'both' },
    );

    await sleep(500);
    expect(circle.getAttribute('cx')).to.be.eqls('20px');

    // em
    circle.style.cx = '1em';
    expect(circle.getAttribute('cx')).to.be.eqls('1em');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.em(1))).to.be.true;
    expect(circle.parsedStyle.cx.equals(CSS.px(16))).to.be.true;

    // rem
    circle.style.cx = '2rem';
    expect(circle.getAttribute('cx')).to.be.eqls('2rem');
    computed = circle.computedStyleMap().get('cx') as CSSUnitValue;
    expect(computed.equals(CSS.rem(2))).to.be.true;
    expect(circle.parsedStyle.cx.equals(CSS.px(32))).to.be.true;
  });
});

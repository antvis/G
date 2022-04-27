import chai, { expect } from 'chai';
import {
  Circle,
  Ellipse,
  Rect,
  Image,
  Text,
  CSS,
  CSSUnitValue,
  CSSKeywordValue,
  CSSRGB,
  Canvas,
} from '../../../lib';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../__tests__/utils';

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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/factory_functions
 */
describe('StyleValueRegistry initialization', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should initialize Document correctly.', () => {
    const documentElement = canvas.document.documentElement;

    // default values
    expect(documentElement.style.fill).to.equal('');
    expect(documentElement.style.fillOpacity).to.equal('1');
    expect(documentElement.style.fontFamily).to.equal('sans-serif');
    expect(documentElement.style.fontSize).to.equal('16px');
    expect(documentElement.style.fontStyle).to.equal('normal');
    expect(documentElement.style.fontVariant).to.equal('normal');
    expect(documentElement.style.fontWeight).to.equal('normal');
    expect(documentElement.style.height).to.equal('');
    expect(documentElement.style.lineCap).to.equal('butt');
    expect(documentElement.style.lineDashOffset).to.equal('0');
    expect(documentElement.style.lineJoin).to.equal('miter');
    expect(documentElement.style.lineWidth).to.equal('1');
    expect(documentElement.style.opacity).to.equal('');
    expect(documentElement.style.stroke).to.equal('');
    expect(documentElement.style.strokeOpacity).to.equal('1');
    expect(documentElement.style.textTransform).to.equal('none');
    expect(documentElement.style.textAlign).to.equal('start');
    expect(documentElement.style.textBaseline).to.equal('alphabetic');
    expect(documentElement.style.transformOrigin).to.equal('');
    expect(documentElement.style.visibility).to.equal('visible');
    expect(documentElement.style.width).to.equal('');
    expect(documentElement.style.x).to.equal(0);
    expect(documentElement.style.y).to.equal(0);
    expect(documentElement.style.z).to.equal(0);
    expect(documentElement.style.zIndex).to.equal(0);
  });

  it('should parse & compute CSS properties for Circle correctly.', async () => {
    const circle = new Circle({
      style: {
        x: 200,
        y: 200,
        r: 100,
        fill: '#f00',
        stroke: 'black',
        lineWidth: 2,
      },
    });

    /**
     * user-defined values
     */
    // use `getAttribute` to access
    expect(circle.getAttribute('x')).to.be.eqls(200);
    expect(circle.getAttribute('y')).to.be.eqls(200);
    expect(circle.getAttribute('r')).to.be.eqls(100);
    expect(circle.getAttribute('fill')).to.be.eqls('#f00');
    expect(circle.getAttribute('stroke')).to.be.eqls('black');
    expect(circle.getAttribute('lineWidth')).to.be.eqls(2);
    // use `style` to access
    expect(circle.style.x).to.be.eqls(200);
    expect(circle.style.y).to.be.eqls(200);
    expect(circle.style.r).to.be.eqls(100);
    expect(circle.style.fill).to.be.eqls('#f00');
    expect(circle.style.stroke).to.be.eqls('black');
    expect(circle.style.lineWidth).to.be.eqls(2);
    // unsupported property
    // @ts-ignore
    expect(circle.style.xxxxx).to.be.null;

    /**
     * initial values
     */
    expect(circle.getAttribute('z')).to.be.eqls(0);
    expect(circle.getAttribute('opacity')).to.be.eqls('');
    expect(circle.getAttribute('fillOpacity')).to.be.eqls('');
    expect(circle.getAttribute('strokeOpacity')).to.be.eqls('');
    expect(circle.getAttribute('visibility')).to.be.eqls('');
    expect(circle.getAttribute('lineJoin')).to.be.eqls('');
    expect(circle.getAttribute('lineCap')).to.be.eqls('');
    // expect(circle.getAttribute('transform')).to.be.eqls('');
    expect(circle.getAttribute('transformOrigin')).to.be.eqls('center');
    expect(circle.getAttribute('anchor')).to.be.eqls([0.5, 0.5]);

    /**
     * computed values
     */
    const styleMap = circle.computedStyleMap();
    // user-defined
    expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((styleMap.get('r') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    const fill = styleMap.get('fill') as CSSRGB;
    expect(fill.r).to.be.eqls(255);
    expect(fill.g).to.be.eqls(0);
    expect(fill.b).to.be.eqls(0);
    expect(fill.alpha).to.be.eqls(1);
    const stroke = styleMap.get('stroke') as CSSRGB;
    expect(stroke.r).to.be.eqls(0);
    expect(stroke.g).to.be.eqls(0);
    expect(stroke.b).to.be.eqls(0);
    expect(stroke.alpha).to.be.eqls(1);
    expect((styleMap.get('lineWidth') as CSSUnitValue).equals(CSS.px(2))).to.be.true;
    // default
    const opacity = styleMap.get('opacity') as CSSKeywordValue;
    expect(opacity instanceof CSSKeywordValue).to.be.true;
    expect(opacity.value).to.be.eqls('unset');
    const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    expect(fillOpacity instanceof CSSKeywordValue).to.be.true;
    expect(fillOpacity.value).to.be.eqls('unset');
    const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    expect(strokeOpacity instanceof CSSKeywordValue).to.be.true;
    expect(strokeOpacity.value).to.be.eqls('unset');
    const visibility = styleMap.get('visibility') as CSSKeywordValue;
    expect(visibility instanceof CSSKeywordValue).to.be.true;
    expect(visibility.value).to.be.eqls('unset');
    const lineJoin = styleMap.get('lineJoin') as CSSKeywordValue;
    expect(lineJoin instanceof CSSKeywordValue).to.be.true;
    expect(lineJoin.value).to.be.eqls('unset');
    const lineCap = styleMap.get('lineCap') as CSSKeywordValue;
    expect(lineCap instanceof CSSKeywordValue).to.be.true;
    expect(lineCap.value).to.be.eqls('unset');
    const transformOrigin = styleMap.get('transformOrigin') as [CSSUnitValue, CSSUnitValue];
    expect(transformOrigin.length).to.be.eqls(2);
    expect(transformOrigin[0].equals(CSS.percent(50))).to.be.true;
    expect(transformOrigin[1].equals(CSS.percent(50))).to.be.true;
    const anchor = styleMap.get('anchor') as [CSSUnitValue, CSSUnitValue];
    expect(anchor.length).to.be.eqls(2);
    expect(anchor[0].equals(CSS.number(0.5))).to.be.true;
    expect(anchor[1].equals(CSS.number(0.5))).to.be.true;
    expect(styleMap.get('xxxx')).to.be.undefined;

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    let parsedStyle = circle.parsedStyle;
    expect(parsedStyle.x.equals(CSS.px(200))).to.be.true;
    expect(parsedStyle.y.equals(CSS.px(200))).to.be.true;
    expect(parsedStyle.z.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.r.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.fill instanceof CSSRGB).to.be.true;
    expect((parsedStyle.fill as CSSRGB).r).to.be.eqls(255);
    expect((parsedStyle.fill as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).alpha).to.be.eqls(1);
    expect(parsedStyle.stroke instanceof CSSRGB).to.be.true;
    expect((parsedStyle.stroke as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).to.be.eqls(1);
    expect((parsedStyle.opacity as CSSUnitValue).equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.transformOrigin.length).to.be.eqls(2);
    expect(parsedStyle.transformOrigin[0].equals(CSS.percent(50))).to.be.true;
    expect(parsedStyle.transformOrigin[1].equals(CSS.percent(50))).to.be.true;
    // [x, y] -> [x, y, z]
    expect(parsedStyle.anchor.length).to.be.eqls(3);
    expect(parsedStyle.anchor[0].equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.anchor[1].equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.anchor[2].equals(CSS.number(0))).to.be.true;
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.fillOpacity).to.be.undefined;
    expect(parsedStyle.lineCap).to.be.undefined;
    expect(parsedStyle.lineJoin).to.be.undefined;
    expect(parsedStyle.strokeOpacity).to.be.undefined;
    expect(parsedStyle.visibility).to.be.undefined;
    // @ts-ignore
    expect(parsedStyle.xxxxx).to.be.undefined;

    /**
     * append it to document
     */
    canvas.appendChild(circle);

    // wait until next frame
    await sleep(100);

    parsedStyle = circle.parsedStyle;
    // inherit from document.documentElement
    expect(parsedStyle.fillOpacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.strokeOpacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.lineCap.value).to.be.eqls('butt');
    expect(parsedStyle.lineJoin.value).to.be.eqls('miter');
    expect(parsedStyle.visibility.value).to.be.eqls('visible');
  });

  it('should parse & compute CSS properties for Ellipse correctly.', () => {
    const ellipse = new Ellipse({
      style: {
        rx: 200,
        ry: '100px',
        fill: 'transparent',
        lineWidth: 2,
        lineJoin: 'bevel',
        opacity: 0.5,
        fillOpacity: 0.5,
      },
    });

    /**
     * user-defined values
     */
    // use `getAttribute` to access
    expect(ellipse.getAttribute('x')).to.be.eqls(0);
    expect(ellipse.getAttribute('y')).to.be.eqls(0);
    expect(ellipse.getAttribute('z')).to.be.eqls(0);
    expect(ellipse.getAttribute('opacity')).to.be.eqls(0.5);
    expect(ellipse.getAttribute('fillOpacity')).to.be.eqls(0.5);
    expect(ellipse.getAttribute('rx')).to.be.eqls(200);
    expect(ellipse.getAttribute('ry')).to.be.eqls('100px');
    expect(ellipse.getAttribute('fill')).to.be.eqls('transparent');
    expect(ellipse.getAttribute('stroke')).to.be.eqls('');
    expect(ellipse.getAttribute('lineWidth')).to.be.eqls(2);
    expect(ellipse.getAttribute('lineJoin')).to.be.eqls('bevel');
    // use `style` to access
    expect(ellipse.style.stroke).to.be.eqls('');
    expect(ellipse.style.lineWidth).to.be.eqls(2);
    // unsupported property
    // @ts-ignore
    expect(ellipse.style.xxxxx).to.be.null;

    /**
     * computed values
     */
    const styleMap = ellipse.computedStyleMap();
    // user-defined
    // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((styleMap.get('rx') as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    expect((styleMap.get('ry') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    // 'transparent'
    const fill = styleMap.get('fill') as CSSRGB;
    expect(fill.r).to.be.eqls(0);
    expect(fill.g).to.be.eqls(0);
    expect(fill.b).to.be.eqls(0);
    expect(fill.alpha).to.be.eqls(0);
    // 'unset'
    const stroke = styleMap.get('stroke') as CSSKeywordValue;
    expect(stroke instanceof CSSKeywordValue).to.be.true;
    expect(stroke.value).eqls('unset');
    expect((styleMap.get('lineWidth') as CSSUnitValue).equals(CSS.px(2))).to.be.true;
    // default
    const opacity = styleMap.get('opacity') as CSSUnitValue;
    expect(opacity instanceof CSSUnitValue).to.be.true;
    expect(opacity.equals(CSS.number(0.5))).to.be.true;
    const fillOpacity = styleMap.get('fillOpacity') as CSSUnitValue;
    expect(fillOpacity instanceof CSSUnitValue).to.be.true;
    expect(fillOpacity.equals(CSS.number(0.5))).to.be.true;
    const lineJoin = styleMap.get('lineJoin') as CSSKeywordValue;
    expect(lineJoin instanceof CSSKeywordValue).to.be.true;
    expect(lineJoin.value).to.be.eqls('bevel');
    const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    expect(strokeOpacity instanceof CSSKeywordValue).to.be.true;
    expect(strokeOpacity.value).to.be.eqls('unset');
    const visibility = styleMap.get('visibility') as CSSKeywordValue;
    expect(visibility instanceof CSSKeywordValue).to.be.true;
    expect(visibility.value).to.be.eqls('unset');
    const transformOrigin = styleMap.get('transformOrigin') as [CSSUnitValue, CSSUnitValue];
    expect(transformOrigin.length).to.be.eqls(2);
    expect(transformOrigin[0].equals(CSS.percent(50))).to.be.true;
    expect(transformOrigin[1].equals(CSS.percent(50))).to.be.true;
    const anchor = styleMap.get('anchor') as [CSSUnitValue, CSSUnitValue];
    expect(anchor.length).to.be.eqls(2);
    expect(anchor[0].equals(CSS.number(0.5))).to.be.true;
    expect(anchor[1].equals(CSS.number(0.5))).to.be.true;
    expect(styleMap.get('xxxx')).to.be.undefined;

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = ellipse.parsedStyle;
    expect(parsedStyle.x.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.y.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.z.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.rx.equals(CSS.px(200))).to.be.true;
    expect(parsedStyle.ry.equals(CSS.px(100))).to.be.true;
    // 'transparent'
    expect(parsedStyle.fill instanceof CSSRGB).to.be.true;
    expect((parsedStyle.fill as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).alpha).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).isNone).to.be.false;
    // 'none'
    expect(parsedStyle.stroke instanceof CSSRGB).to.be.true;
    expect((parsedStyle.stroke as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).isNone).to.be.true;
    expect(parsedStyle.opacity.equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.fillOpacity.equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.transformOrigin.length).to.be.eqls(2);
    expect(parsedStyle.transformOrigin[0].equals(CSS.percent(50))).to.be.true;
    expect(parsedStyle.transformOrigin[1].equals(CSS.percent(50))).to.be.true;
    // [x, y] -> [x, y, z]
    expect(parsedStyle.anchor.length).to.be.eqls(3);
    expect(parsedStyle.anchor[0].equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.anchor[1].equals(CSS.number(0.5))).to.be.true;
    expect(parsedStyle.anchor[2].equals(CSS.number(0))).to.be.true;
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.visibility).to.be.undefined;
    expect(parsedStyle.lineCap).to.be.undefined;
    expect(parsedStyle.lineJoin.toString()).to.be.eqls('bevel');
    // @ts-ignore
    expect(parsedStyle.xxxxx).to.be.undefined;
  });

  it('should parse & compute CSS properties for Rect correctly.', () => {
    const rect = new Rect({
      style: {
        width: 200,
        height: '100px',
        fill: 'none',
        visibility: 'hidden',
      },
    });
    rect.setPosition(100, 100);

    /**
     * user-defined values
     */
    expect(rect.getAttribute('x')).to.be.eqls(100);
    expect(rect.getAttribute('y')).to.be.eqls(100);
    expect(rect.getAttribute('z')).to.be.eqls(0);
    expect(rect.getAttribute('width')).to.be.eqls(200);
    expect(rect.getAttribute('height')).to.be.eqls('100px');
    expect(rect.getAttribute('fill')).to.be.eqls('none');
    // use `style` to access
    expect(rect.style.width).to.be.eqls(200);
    expect(rect.style.height).to.be.eqls('100px');

    /**
     * initial values
     */
    expect(rect.getAttribute('radius')).to.be.eqls('');
    expect(rect.getAttribute('lineWidth')).to.be.eqls('0');

    /**
     * computed values
     */
    const styleMap = rect.computedStyleMap();
    // user-defined
    // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((styleMap.get('width') as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    expect((styleMap.get('height') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    const radius = styleMap.get('radius') as CSSKeywordValue;
    expect(radius instanceof CSSKeywordValue).to.be.true;
    expect(radius.value).eqls('unset');
    expect((styleMap.get('lineWidth') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    // 'none'
    const fill = styleMap.get('fill') as CSSKeywordValue;
    expect(fill instanceof CSSKeywordValue).to.be.true;
    expect(fill.value).eqls('none');
    // 'unset'
    const stroke = styleMap.get('stroke') as CSSKeywordValue;
    expect(stroke instanceof CSSKeywordValue).to.be.true;
    expect(stroke.value).eqls('unset');
    // default
    const opacity = styleMap.get('opacity') as CSSKeywordValue;
    expect(opacity instanceof CSSKeywordValue).to.be.true;
    expect(opacity.value).to.be.eqls('unset');
    const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    expect(fillOpacity instanceof CSSKeywordValue).to.be.true;
    expect(fillOpacity.value).to.be.eqls('unset');
    const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    expect(strokeOpacity instanceof CSSKeywordValue).to.be.true;
    expect(strokeOpacity.value).to.be.eqls('unset');
    const visibility = styleMap.get('visibility') as CSSKeywordValue;
    expect(visibility instanceof CSSKeywordValue).to.be.true;
    expect(visibility.value).to.be.eqls('hidden');
    const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    expect(transformOrigin instanceof CSSKeywordValue).to.be.true;
    expect(transformOrigin.value).to.be.eqls('unset');
    const anchor = styleMap.get('anchor') as [CSSUnitValue, CSSUnitValue];
    expect(anchor.length).to.be.eqls(2);
    expect(anchor[0].equals(CSS.number(0))).to.be.true;
    expect(anchor[1].equals(CSS.number(0))).to.be.true;
    expect(styleMap.get('xxxx')).to.be.undefined;

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = rect.parsedStyle;
    expect(parsedStyle.x.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.y.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.z.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.width.equals(CSS.px(200))).to.be.true;
    expect(parsedStyle.height.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.radius.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.lineWidth.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.fill instanceof CSSRGB).to.be.true;
    expect((parsedStyle.fill as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).alpha).to.be.eqls(0);
    expect(parsedStyle.stroke instanceof CSSRGB).to.be.true;
    expect((parsedStyle.stroke as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).to.be.eqls(0);
    expect(parsedStyle.opacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.transformOrigin.length).to.be.eqls(2);
    expect(parsedStyle.transformOrigin[0].equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.transformOrigin[1].equals(CSS.px(0))).to.be.true;
    // [x, y] -> [x, y, z]
    expect(parsedStyle.anchor.length).to.be.eqls(3);
    expect(parsedStyle.anchor[0].equals(CSS.number(0))).to.be.true;
    expect(parsedStyle.anchor[1].equals(CSS.number(0))).to.be.true;
    expect(parsedStyle.anchor[2].equals(CSS.number(0))).to.be.true;
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.fillOpacity).to.be.undefined;
    expect(parsedStyle.strokeOpacity).to.be.undefined;
    //  expect(parsedStyle.visibility).to.be.undefined;
    // @ts-ignore
    expect(parsedStyle.xxxxx).to.be.undefined;
  });

  it('should parse & compute CSS properties for Image correctly.', () => {
    const image = new Image({
      style: {
        width: 200,
        height: '100px',
        img: 'url',
        visibility: 'visible',
      },
    });
    image.setPosition(100, 100);

    /**
     * user-defined values
     */
    expect(image.getAttribute('x')).to.be.eqls(100);
    expect(image.getAttribute('y')).to.be.eqls(100);
    expect(image.getAttribute('z')).to.be.eqls(0);
    expect(image.getAttribute('width')).to.be.eqls(200);
    expect(image.getAttribute('height')).to.be.eqls('100px');
    expect(image.getAttribute('img')).to.be.eqls('url');
    // use `style` to access
    expect(image.style.width).to.be.eqls(200);
    expect(image.style.height).to.be.eqls('100px');

    /**
     * computed values
     */
    const styleMap = image.computedStyleMap();

    // user-defined
    // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect(styleMap.get('img')).to.be.eqls('url');
    expect((styleMap.get('width') as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    expect((styleMap.get('height') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
    // default
    const opacity = styleMap.get('opacity') as CSSKeywordValue;
    expect(opacity instanceof CSSKeywordValue).to.be.true;
    expect(opacity.value).to.be.eqls('unset');
    const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    expect(fillOpacity instanceof CSSKeywordValue).to.be.true;
    expect(fillOpacity.value).to.be.eqls('unset');
    const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    expect(strokeOpacity instanceof CSSKeywordValue).to.be.true;
    expect(strokeOpacity.value).to.be.eqls('unset');
    const visibility = styleMap.get('visibility') as CSSKeywordValue;
    expect(visibility instanceof CSSKeywordValue).to.be.true;
    expect(visibility.value).to.be.eqls('visible');
    const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    expect(transformOrigin instanceof CSSKeywordValue).to.be.true;
    expect(transformOrigin.value).to.be.eqls('unset');
    const anchor = styleMap.get('anchor') as [CSSUnitValue, CSSUnitValue];
    expect(anchor.length).to.be.eqls(2);
    expect(anchor[0].equals(CSS.number(0))).to.be.true;
    expect(anchor[1].equals(CSS.number(0))).to.be.true;
    expect(styleMap.get('xxxx')).to.be.undefined;

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = image.parsedStyle;
    expect(parsedStyle.img).to.be.eqls('url');
    expect(parsedStyle.x.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.y.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.z.equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.width.equals(CSS.px(200))).to.be.true;
    expect(parsedStyle.height.equals(CSS.px(100))).to.be.true;
    expect(parsedStyle.fill instanceof CSSRGB).to.be.true;
    expect((parsedStyle.fill as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).alpha).to.be.eqls(0);
    expect(parsedStyle.stroke instanceof CSSRGB).to.be.true;
    expect((parsedStyle.stroke as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).to.be.eqls(0);
    expect(parsedStyle.opacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.visibility instanceof CSSKeywordValue).to.be.true;
    expect(parsedStyle.visibility.value).to.be.eqls('visible');
    expect(parsedStyle.transformOrigin.length).to.be.eqls(2);
    expect(parsedStyle.transformOrigin[0].equals(CSS.px(0))).to.be.true;
    expect(parsedStyle.transformOrigin[1].equals(CSS.px(0))).to.be.true;
    // [x, y] -> [x, y, z]
    expect(parsedStyle.anchor.length).to.be.eqls(3);
    expect(parsedStyle.anchor[0].equals(CSS.number(0))).to.be.true;
    expect(parsedStyle.anchor[1].equals(CSS.number(0))).to.be.true;
    expect(parsedStyle.anchor[2].equals(CSS.number(0))).to.be.true;
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.fillOpacity).to.be.undefined;
    expect(parsedStyle.strokeOpacity).to.be.undefined;
    // @ts-ignore
    expect(parsedStyle.xxxxx).to.be.undefined;
  });

  it('should parse & compute CSS properties for Text correctly.', async () => {
    const text = new Text({
      style: {
        text: 'hello',
        fontFamily: 'PingFang SC',
      },
    });
    /**
     * user-defined values
     */
    expect(text.getAttribute('text')).to.be.eqls('hello');
    expect(text.getAttribute('fontFamily')).to.be.eqls('PingFang SC');
    expect(text.getAttribute('fontSize')).to.be.eqls('');
    expect(text.getAttribute('fontWeight')).to.be.eqls('');
    expect(text.getAttribute('fontStyle')).to.be.eqls('');
    expect(text.getAttribute('fontVariant')).to.be.eqls('');
    expect(text.getAttribute('textAlign')).to.be.eqls('');
    expect(text.getAttribute('textBaseline')).to.be.eqls('');
    expect(text.getAttribute('fill')).to.be.eqls('black');
    expect(text.getAttribute('stroke')).to.be.eqls('black');
    expect(text.getAttribute('letterSpacing')).to.be.eqls(0);
    expect(text.getAttribute('lineHeight')).to.be.eqls(0);
    expect(text.getAttribute('lineWidth')).to.be.eqls(0);
    expect(text.getAttribute('miterLimit')).to.be.eqls(10);
    expect(text.getAttribute('whiteSpace')).to.be.eqls('pre');
    expect(text.getAttribute('wordWrap')).to.be.eqls(false);
    expect(text.getAttribute('leading')).to.be.eqls(0);
    expect(text.getAttribute('dx')).to.be.eqls(0);
    expect(text.getAttribute('dy')).to.be.eqls(0);

    /**
     * computed values
     */
    const styleMap = text.computedStyleMap();
    // user-defined
    expect(styleMap.get('text')).to.be.eqls('hello');
    expect(styleMap.get('fontFamily')).to.be.eqls('PingFang SC');
    const fontSize = styleMap.get('fontSize') as CSSKeywordValue;
    expect(fontSize instanceof CSSKeywordValue).to.be.true;
    expect(fontSize.value).to.be.eqls('unset');
    const fontWeight = styleMap.get('fontWeight') as CSSKeywordValue;
    expect(fontWeight instanceof CSSKeywordValue).to.be.true;
    expect(fontWeight.value).to.be.eqls('unset');
    const fontStyle = styleMap.get('fontStyle') as CSSKeywordValue;
    expect(fontStyle instanceof CSSKeywordValue).to.be.true;
    expect(fontStyle.value).to.be.eqls('unset');
    const fontVariant = styleMap.get('fontVariant') as CSSKeywordValue;
    expect(fontVariant instanceof CSSKeywordValue).to.be.true;
    expect(fontVariant.value).to.be.eqls('unset');
    const textAlign = styleMap.get('textAlign') as CSSKeywordValue;
    expect(textAlign instanceof CSSKeywordValue).to.be.true;
    expect(textAlign.value).to.be.eqls('unset');
    const textBaseline = styleMap.get('textBaseline') as CSSKeywordValue;
    expect(textBaseline instanceof CSSKeywordValue).to.be.true;
    expect(textBaseline.value).to.be.eqls('unset');

    /**
     * used values
     */
    let parsedStyle = text.parsedStyle;
    expect(parsedStyle.fill instanceof CSSRGB).to.be.true;
    expect((parsedStyle.fill as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.fill as CSSRGB).alpha).to.be.eqls(1);
    expect(parsedStyle.stroke instanceof CSSRGB).to.be.true;
    expect((parsedStyle.stroke as CSSRGB).r).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).g).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).b).to.be.eqls(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).to.be.eqls(1);
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.fillOpacity).to.be.undefined;
    expect(parsedStyle.strokeOpacity).to.be.undefined;
    expect(parsedStyle.lineCap).to.be.undefined;
    expect(parsedStyle.lineJoin).to.be.undefined;
    expect(parsedStyle.visibility).to.be.undefined;
    expect(parsedStyle.fontWeight).to.be.undefined;
    expect(parsedStyle.fontStyle).to.be.undefined;
    expect(parsedStyle.fontVariant).to.be.undefined;
    expect(parsedStyle.textAlign).to.be.undefined;
    expect(parsedStyle.textBaseline).to.be.undefined;

    /**
     * append it to document
     */
    canvas.appendChild(text);

    // wait until next frame
    await sleep(100);

    parsedStyle = text.parsedStyle;
    // inherit from document.documentElement
    expect(parsedStyle.fillOpacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.strokeOpacity.equals(CSS.number(1))).to.be.true;
    expect(parsedStyle.lineCap.value).to.be.eqls('butt');
    expect(parsedStyle.lineJoin.value).to.be.eqls('miter');
    expect(parsedStyle.visibility.value).to.be.eqls('visible');
    expect(parsedStyle.text).to.be.eqls('hello');
    expect(parsedStyle.fontFamily).to.be.eqls('PingFang SC');
    expect(parsedStyle.fontSize.toString()).to.be.eqls('16px');
    expect(parsedStyle.fontWeight.value).to.be.eqls('normal');
    expect(parsedStyle.fontVariant.value).to.be.eqls('normal');
    expect(parsedStyle.fontStyle.value).to.be.eqls('normal');
    expect(parsedStyle.textAlign.value).to.be.eqls('start');
    expect(parsedStyle.textBaseline.value).to.be.eqls('alphabetic');
    expect(parsedStyle.textTransform.value).to.be.eqls('none');
  });
});

import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import {
  Canvas,
  Circle,
  CSS,
  CSSKeywordValue,
  CSSRGB,
  CSSUnitValue,
  Ellipse,
  Image,
  Rect,
  Text,
} from '../../../packages/g/src';

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
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should initialize Document correctly.', () => {
    const documentElement = canvas.document.documentElement;

    // default values
    expect(documentElement.style.fill).toBeUndefined();
    expect(documentElement.style.fillOpacity).toBe('1');
    expect(documentElement.style.fontFamily).toBe('sans-serif');
    expect(documentElement.style.fontSize).toBe('16px');
    expect(documentElement.style.fontStyle).toBe('normal');
    expect(documentElement.style.fontVariant).toBe('normal');
    expect(documentElement.style.fontWeight).toBe('normal');
    expect(documentElement.style.height).toBeUndefined();
    expect(documentElement.style.lineCap).toBe('butt');
    expect(documentElement.style.lineDashOffset).toBe('0');
    expect(documentElement.style.lineJoin).toBe('miter');
    expect(documentElement.style.lineWidth).toBe('1');
    expect(documentElement.style.increasedLineWidthForHitTesting).toBe('0');
    expect(documentElement.style.opacity).toBe('1');
    expect(documentElement.style.stroke).toBeUndefined();
    expect(documentElement.style.strokeOpacity).toBe('1');
    expect(documentElement.style.textTransform).toBe('none');
    expect(documentElement.style.textAlign).toBe('start');
    expect(documentElement.style.textBaseline).toBe('alphabetic');
    expect(documentElement.style.transformOrigin).toBeUndefined();
    expect(documentElement.style.visibility).toBe('visible');
    expect(documentElement.style.pointerEvents).toBe('auto');
    expect(documentElement.style.width).toBeUndefined();
    expect(documentElement.style.zIndex).toBeUndefined();

    // hide all children
    documentElement.style.visibility = 'hidden';
    // let styleMap = documentElement.computedStyleMap();
    expect(documentElement.style.visibility).toBe('hidden');
    // computed value
    // expect((styleMap.get('visibility') as string).toString()).toBe('hidden');
    // used value
    // expect(documentElement.parsedStyle.visibility.toString()).toBe('hidden');

    documentElement.style.visibility = 'unset';
    expect(documentElement.style.visibility).toBe('unset');
    // computed value
    // styleMap = documentElement.computedStyleMap();
    // expect((styleMap.get('visibility') as string).toString()).toBe('unset');
    // used value
    // expect(documentElement.parsedStyle.visibility.toString()).toBe('visible');

    // disable pointerEvents
    documentElement.style.pointerEvents = 'none';
    // styleMap = documentElement.computedStyleMap();
    expect(documentElement.style.pointerEvents).toBe('none');
    // computed value
    // expect((styleMap.get('pointerEvents') as string).toString()).toBe('none');
    // used value
    expect(documentElement.parsedStyle.pointerEvents.toString()).toBe('none');

    // enable pointerEvents
    documentElement.style.pointerEvents = 'auto';
    // styleMap = documentElement.computedStyleMap();
    expect(documentElement.style.pointerEvents).toBe('auto');
    // computed value
    // expect((styleMap.get('pointerEvents') as string).toString()).toBe('auto');
    // used value
    expect(documentElement.parsedStyle.pointerEvents.toString()).toBe('auto');
  });

  it('should parse & compute CSS properties for Circle correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 200,
        cy: 200,
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
    expect(circle.getAttribute('cx')).toBe(200);
    expect(circle.getAttribute('cy')).toBe(200);
    expect(circle.getAttribute('r')).toBe(100);
    expect(circle.getAttribute('fill')).toBe('#f00');
    expect(circle.getAttribute('stroke')).toBe('black');
    expect(circle.getAttribute('lineWidth')).toBe(2);
    // use `style` to access
    expect(circle.style.cx).toBe(200);
    expect(circle.style.cy).toBe(200);
    expect(circle.style.r).toBe(100);
    expect(circle.style.fill).toBe('#f00');
    expect(circle.style.stroke).toBe('black');
    expect(circle.style.lineWidth).toBe(2);
    // unsupported property
    // @ts-ignore
    // expect(circle.style.xxxxx).toBeNull();
    expect(circle.style.xxxxx).toBeUndefined();

    /**
     * initial values
     */
    // @ts-ignore
    expect(circle.getAttribute('z')).toBeUndefined();
    expect(circle.getAttribute('opacity')).toBeUndefined();
    expect(circle.getAttribute('fillOpacity')).toBeUndefined();
    expect(circle.getAttribute('strokeOpacity')).toBeUndefined();
    expect(circle.getAttribute('visibility')).toBeUndefined();
    expect(circle.getAttribute('lineJoin')).toBeUndefined();
    expect(circle.getAttribute('lineCap')).toBeUndefined();
    expect(circle.getAttribute('transform')).toBeUndefined();
    expect(circle.getAttribute('transformOrigin')).toBeUndefined();

    // /**
    //  * computed values
    //  */
    // const styleMap = circle.computedStyleMap();
    // // user-defined
    // expect(
    //   (styleMap.get('cx') as CSSUnitValue).equals(CSS.px(200)),
    // ).toBeTruthy();
    // expect(
    //   (styleMap.get('cy') as CSSUnitValue).equals(CSS.px(200)),
    // ).toBeTruthy();
    // // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // expect(
    //   (styleMap.get('r') as CSSUnitValue).equals(CSS.px(100)),
    // ).toBeTruthy();
    // const fill = styleMap.get('fill') as CSSRGB;
    // expect(fill.r).toBe(255);
    // expect(fill.g).toBe(0);
    // expect(fill.b).toBe(0);
    // expect(fill.alpha).toBe(1);
    // const stroke = styleMap.get('stroke') as CSSRGB;
    // expect(stroke.r).toBe(0);
    // expect(stroke.g).toBe(0);
    // expect(stroke.b).toBe(0);
    // expect(stroke.alpha).toBe(1);
    // expect(
    //   (styleMap.get('lineWidth') as CSSUnitValue).equals(CSS.px(2)),
    // ).toBeTruthy();
    // // default
    // const opacity = styleMap.get('opacity') as CSSKeywordValue;
    // expect(opacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(opacity.value).toBe('unset');
    // const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    // expect(fillOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(fillOpacity.value).toBe('unset');
    // const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    // expect(strokeOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(strokeOpacity.value).toBe('unset');
    // const visibility = styleMap.get('visibility') as CSSKeywordValue;
    // expect(visibility instanceof CSSKeywordValue).toBeTruthy();
    // expect(visibility.value).toBe('unset');
    // const lineJoin = styleMap.get('lineJoin') as CSSKeywordValue;
    // expect(lineJoin instanceof CSSKeywordValue).toBeTruthy();
    // expect(lineJoin.value).toBe('unset');
    // const lineCap = styleMap.get('lineCap') as CSSKeywordValue;
    // expect(lineCap instanceof CSSKeywordValue).toBeTruthy();
    // expect(lineCap.value).toBe('unset');
    // const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    // expect(transformOrigin instanceof CSSKeywordValue).toBeTruthy();
    // expect(transformOrigin.value).toBe('unset');
    // expect(styleMap.get('xxxx')).toBeUndefined();

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    let parsedStyle = circle.parsedStyle;
    expect(parsedStyle.cx).toBe(200);
    expect(parsedStyle.cy).toBe(200);
    expect(parsedStyle.cz).toBeUndefined();
    expect(parsedStyle.r).toBe(100);
    expect(parsedStyle.fill instanceof CSSRGB).toBeTruthy();
    expect((parsedStyle.fill as CSSRGB).r).toBe(255);
    expect((parsedStyle.fill as CSSRGB).g).toBe(0);
    expect((parsedStyle.fill as CSSRGB).b).toBe(0);
    expect((parsedStyle.fill as CSSRGB).alpha).toBe(1);
    expect(parsedStyle.stroke instanceof CSSRGB).toBeTruthy();
    expect((parsedStyle.stroke as CSSRGB).r).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).g).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).b).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).toBe(1);
    // expect(parsedStyle.transformOrigin!.length).toBe(2);
    // expect(
    //   parsedStyle.transformOrigin![0].equals(CSS.percent(50)),
    // ).toBeTruthy();
    // expect(
    //   parsedStyle.transformOrigin![1].equals(CSS.percent(50)),
    // ).toBeTruthy();
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.opacity).toBeUndefined();
    expect(parsedStyle.fillOpacity).toBeUndefined();
    expect(parsedStyle.lineCap).toBeUndefined();
    expect(parsedStyle.lineJoin).toBeUndefined();
    expect(parsedStyle.strokeOpacity).toBeUndefined();
    expect(parsedStyle.visibility).toBeUndefined();
    expect(parsedStyle.pointerEvents).toBeUndefined();
    // @ts-ignore
    expect(parsedStyle.xxxxx).toBeUndefined();

    await canvas.ready;
    /**
     * append it to document
     */
    canvas.appendChild(circle);

    // parsedStyle = circle.parsedStyle;
    // // inherit from document.documentElement
    // expect(parsedStyle.fillOpacity).toBe(1);
    // expect(parsedStyle.strokeOpacity).toBe(1);
    // expect(parsedStyle.lineCap).toBe('butt');
    // expect(parsedStyle.lineJoin).toBe('miter');
    // expect(parsedStyle.visibility).toBe('visible');
    // expect(parsedStyle.pointerEvents).toBe('auto');
  });

  it('should parse & compute CSS properties for Ellipse correctly.', () => {
    const ellipse = new Ellipse({
      style: {
        rx: 200,
        ry: 100,
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
    expect(ellipse.getAttribute('cx')).toBeUndefined();
    expect(ellipse.getAttribute('cy')).toBeUndefined();
    expect(ellipse.getAttribute('opacity')).toBe(0.5);
    expect(ellipse.getAttribute('fillOpacity')).toBe(0.5);
    expect(ellipse.getAttribute('rx')).toBe(200);
    expect(ellipse.getAttribute('ry')).toBe(100);
    expect(ellipse.getAttribute('fill')).toBe('transparent');
    expect(ellipse.getAttribute('stroke')).toBeUndefined();
    expect(ellipse.getAttribute('lineWidth')).toBe(2);
    expect(ellipse.getAttribute('lineJoin')).toBe('bevel');
    // use `style` to access
    expect(ellipse.style.stroke).toBeUndefined();
    expect(ellipse.style.lineWidth).toBe(2);
    // unsupported property
    // @ts-ignore
    expect(ellipse.style.xxxxx).toBeUndefined();

    /**
     * computed values
     */
    // const styleMap = ellipse.computedStyleMap();
    // // user-defined
    // // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // expect(
    //   (styleMap.get('rx') as CSSUnitValue).equals(CSS.px(200)),
    // ).toBeTruthy();
    // expect(
    //   (styleMap.get('ry') as CSSUnitValue).equals(CSS.px(100)),
    // ).toBeTruthy();
    // // 'transparent'
    // const fill = styleMap.get('fill') as CSSRGB;
    // expect(fill.r).toBe(0);
    // expect(fill.g).toBe(0);
    // expect(fill.b).toBe(0);
    // expect(fill.alpha).toBe(0);
    // // 'unset'
    // const stroke = styleMap.get('stroke') as CSSKeywordValue;
    // expect(stroke instanceof CSSKeywordValue).toBeTruthy();
    // expect(stroke.value).toBe('unset');
    // expect(
    //   (styleMap.get('lineWidth') as CSSUnitValue).equals(CSS.px(2)),
    // ).toBeTruthy();
    // // default
    // const opacity = styleMap.get('opacity') as CSSUnitValue;
    // expect(opacity instanceof CSSUnitValue).toBeTruthy();
    // expect(opacity.equals(CSS.number(0.5))).toBeTruthy();
    // const fillOpacity = styleMap.get('fillOpacity') as CSSUnitValue;
    // expect(fillOpacity instanceof CSSUnitValue).toBeTruthy();
    // expect(fillOpacity.equals(CSS.number(0.5))).toBeTruthy();
    // const lineJoin = styleMap.get('lineJoin') as CSSKeywordValue;
    // expect(lineJoin instanceof CSSKeywordValue).toBeTruthy();
    // expect(lineJoin.value).toBe('bevel');
    // const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    // expect(strokeOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(strokeOpacity.value).toBe('unset');
    // const visibility = styleMap.get('visibility') as CSSKeywordValue;
    // expect(visibility instanceof CSSKeywordValue).toBeTruthy();
    // expect(visibility.value).toBe('unset');
    // const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    // expect(transformOrigin instanceof CSSKeywordValue).toBeTruthy();
    // expect(transformOrigin.value).toBe('unset');
    // expect(styleMap.get('xxxx')).toBeUndefined();

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = ellipse.parsedStyle;
    expect(parsedStyle.cx).toBeUndefined();
    expect(parsedStyle.cy).toBeUndefined();
    expect(parsedStyle.rx).toBe(200);
    expect(parsedStyle.ry).toBe(100);
    // 'transparent'
    expect(parsedStyle.fill instanceof CSSRGB).toBeTruthy();
    expect((parsedStyle.fill as CSSRGB).r).toBe(0);
    expect((parsedStyle.fill as CSSRGB).g).toBe(0);
    expect((parsedStyle.fill as CSSRGB).b).toBe(0);
    expect((parsedStyle.fill as CSSRGB).alpha).toBe(0);
    expect((parsedStyle.fill as CSSRGB).isNone).toBeFalsy();
    // 'none'
    // expect(parsedStyle.stroke instanceof CSSRGB).toBeTruthy();
    // expect((parsedStyle.stroke as CSSRGB).r).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).g).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).b).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).alpha).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).isNone).toBeTruthy();
    expect(parsedStyle.opacity).toBe(0.5);
    expect(parsedStyle.fillOpacity).toBe(0.5);
    // expect(parsedStyle.transformOrigin!.length).toBe(2);
    // expect(
    //   parsedStyle.transformOrigin![0].equals(CSS.percent(50)),
    // ).toBeTruthy();
    // expect(
    //   parsedStyle.transformOrigin![1].equals(CSS.percent(50)),
    // ).toBeTruthy();
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.visibility).toBeUndefined();
    expect(parsedStyle.lineCap).toBeUndefined();
    expect(parsedStyle.lineJoin).toBe('bevel');
    // @ts-ignore
    expect(parsedStyle.xxxxx).toBeUndefined();
  });

  it('should parse & compute CSS properties for Rect correctly.', async () => {
    const rect = new Rect({
      style: {
        width: 200,
        height: 100,
        fill: 'none',
        visibility: 'hidden',
      },
    });
    rect.setPosition(100, 100);

    /**
     * user-defined values
     */
    expect(rect.getAttribute('x')).toBeUndefined();
    expect(rect.getAttribute('y')).toBeUndefined();
    expect(rect.getAttribute('z')).toBeUndefined();
    expect(rect.getAttribute('width')).toBe(200);
    expect(rect.getAttribute('height')).toBe(100);
    expect(rect.getAttribute('fill')).toBe('none');
    // use `style` to access
    expect(rect.style.width).toBe(200);
    expect(rect.style.height).toBe(100);

    /**
     * initial values
     */
    expect(rect.getAttribute('radius')).toBeUndefined();
    expect(rect.getAttribute('lineWidth')).toBeUndefined();

    // /**
    //  * computed values
    //  */
    // const styleMap = rect.computedStyleMap();
    // // user-defined
    // // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // expect(
    //   (styleMap.get('width') as CSSUnitValue).equals(CSS.px(200)),
    // ).toBeTruthy();
    // expect(
    //   (styleMap.get('height') as CSSUnitValue).equals(CSS.px(100)),
    // ).toBeTruthy();
    // const radius = styleMap.get('radius') as CSSKeywordValue;
    // expect(radius instanceof CSSKeywordValue).toBeTruthy();
    // expect(radius.value).toBe('unset');
    // expect((styleMap.get('lineWidth') as string).toString()).toBe('unset');
    // // 'none'
    // const fill = styleMap.get('fill') as CSSKeywordValue;
    // expect(fill instanceof CSSKeywordValue).toBeTruthy();
    // expect(fill.value).toBe('none');
    // // 'unset'
    // const stroke = styleMap.get('stroke') as CSSKeywordValue;
    // expect(stroke instanceof CSSKeywordValue).toBeTruthy();
    // expect(stroke.value).toBe('unset');
    // // default
    // const opacity = styleMap.get('opacity') as CSSKeywordValue;
    // expect(opacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(opacity.value).toBe('unset');
    // const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    // expect(fillOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(fillOpacity.value).toBe('unset');
    // const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    // expect(strokeOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(strokeOpacity.value).toBe('unset');
    // const visibility = styleMap.get('visibility') as CSSKeywordValue;
    // expect(visibility instanceof CSSKeywordValue).toBeTruthy();
    // expect(visibility.value).toBe('hidden');
    // const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    // expect(transformOrigin instanceof CSSKeywordValue).toBeTruthy();
    // expect(transformOrigin.value).toBe('unset');
    // expect(styleMap.get('xxxx')).toBeUndefined();

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = rect.parsedStyle;
    expect(parsedStyle.x).toBeUndefined();
    expect(parsedStyle.y).toBeUndefined();
    // expect(parsedStyle.z.equals(CSS.px(0))).toBeTruthy();
    expect(parsedStyle.width).toBe(200);
    expect(parsedStyle.height).toBe(100);
    // expect(parsedStyle.radius![0]).toBe(0);
    // expect(parsedStyle.radius![1]).toBe(0);
    // expect(parsedStyle.radius![2]).toBe(0);
    // expect(parsedStyle.radius![3]).toBe(0);
    // expect(parsedStyle.fill instanceof CSSRGB).toBeTruthy();
    // expect((parsedStyle.fill as CSSRGB).r).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).g).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).b).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).alpha).toBe(0);
    // expect(parsedStyle.stroke instanceof CSSRGB).toBeTruthy();
    // expect((parsedStyle.stroke as CSSRGB).r).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).g).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).b).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).alpha).toBe(0);
    // expect(parsedStyle.transformOrigin!.length).toBe(2);
    // expect(parsedStyle.transformOrigin![0].equals(CSS.px(0))).toBeTruthy();
    // expect(parsedStyle.transformOrigin![1].equals(CSS.px(0))).toBeTruthy();
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.opacity).toBeUndefined();
    expect(parsedStyle.fillOpacity).toBeUndefined();
    expect(parsedStyle.strokeOpacity).toBeUndefined();
    //  expect(parsedStyle.visibility).toBeUndefined();
    // @ts-ignore
    expect(parsedStyle.xxxxx).toBeUndefined();

    await canvas.ready;
    /**
     * append it to document
     */
    canvas.appendChild(rect);

    // inherit from document.documentElement
    // expect(parsedStyle.lineWidth).toBeUndefined();
    // expect(parsedStyle.fillOpacity).toBe(1);
    // expect(parsedStyle.strokeOpacity).toBe(1);
    // expect(parsedStyle.lineCap).toBe('butt');
    // expect(parsedStyle.lineJoin).toBe('miter');
    // expect(parsedStyle.pointerEvents).toBe('auto');
  });

  it('should parse & compute CSS properties for Image correctly.', () => {
    const image = new Image({
      style: {
        width: 200,
        height: 100,
        src: 'url',
        visibility: 'visible',
      },
    });
    image.setPosition(100, 100);

    /**
     * user-defined values
     */
    expect(image.getAttribute('x')).toBeUndefined();
    expect(image.getAttribute('y')).toBeUndefined();
    expect(image.getAttribute('z')).toBeUndefined();
    expect(image.getAttribute('width')).toBe(200);
    expect(image.getAttribute('height')).toBe(100);
    expect(image.getAttribute('src')).toBe('url');
    // use `style` to access
    expect(image.style.width).toBe(200);
    expect(image.style.height).toBe(100);

    // /**
    //  * computed values
    //  */
    // const styleMap = image.computedStyleMap();

    // // user-defined
    // // expect((styleMap.get('x') as CSSUnitValue).equals(CSS.px(100))).toBeTruthy();
    // // expect((styleMap.get('y') as CSSUnitValue).equals(CSS.px(100))).toBeTruthy();
    // // expect((styleMap.get('z') as CSSUnitValue).equals(CSS.px(0))).toBeTruthy();
    // expect(styleMap.get('img')).toBe('url');
    // expect(
    //   (styleMap.get('width') as CSSUnitValue).equals(CSS.px(200)),
    // ).toBeTruthy();
    // expect(
    //   (styleMap.get('height') as CSSUnitValue).equals(CSS.px(100)),
    // ).toBeTruthy();
    // // default
    // const opacity = styleMap.get('opacity') as CSSKeywordValue;
    // expect(opacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(opacity.value).toBe('unset');
    // const fillOpacity = styleMap.get('fillOpacity') as CSSKeywordValue;
    // expect(fillOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(fillOpacity.value).toBe('unset');
    // const strokeOpacity = styleMap.get('strokeOpacity') as CSSKeywordValue;
    // expect(strokeOpacity instanceof CSSKeywordValue).toBeTruthy();
    // expect(strokeOpacity.value).toBe('unset');
    // const visibility = styleMap.get('visibility') as CSSKeywordValue;
    // expect(visibility instanceof CSSKeywordValue).toBeTruthy();
    // expect(visibility.value).toBe('visible');
    // const transformOrigin = styleMap.get('transformOrigin') as CSSKeywordValue;
    // expect(transformOrigin instanceof CSSKeywordValue).toBeTruthy();
    // expect(transformOrigin.value).toBe('unset');
    // expect(styleMap.get('xxxx')).toBeUndefined();

    /**
     * parsed values, will be used in internal renderers such as `g-canvas`
     */
    const parsedStyle = image.parsedStyle;
    expect(parsedStyle.src).toBe('url');
    expect(parsedStyle.x).toBeUndefined();
    expect(parsedStyle.y).toBeUndefined();
    // expect(parsedStyle.z.equals(CSS.px(0))).toBeTruthy();
    expect(parsedStyle.width).toBe(200);
    expect(parsedStyle.height).toBe(100);
    // expect(parsedStyle.fill instanceof CSSRGB).toBeTruthy();
    // expect((parsedStyle.fill as CSSRGB).r).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).g).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).b).toBe(0);
    // expect((parsedStyle.fill as CSSRGB).alpha).toBe(0);
    // expect(parsedStyle.stroke instanceof CSSRGB).toBeTruthy();
    // expect((parsedStyle.stroke as CSSRGB).r).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).g).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).b).toBe(0);
    // expect((parsedStyle.stroke as CSSRGB).alpha).toBe(0);
    expect(parsedStyle.visibility).toBe('visible');
    // expect(parsedStyle.transformOrigin!.length).toBe(2);
    // expect(parsedStyle.transformOrigin![0].equals(CSS.px(0))).toBeTruthy();
    // expect(parsedStyle.transformOrigin![1].equals(CSS.px(0))).toBeTruthy();
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.opacity).toBeUndefined();
    expect(parsedStyle.fillOpacity).toBeUndefined();
    expect(parsedStyle.strokeOpacity).toBeUndefined();
    // @ts-ignore
    expect(parsedStyle.xxxxx).toBeUndefined();
  });

  it.skip('should parse & compute CSS properties for Text correctly.', async () => {
    const text = new Text({
      style: {
        text: 'hello',
        fontFamily: 'PingFang SC',
      },
    });
    /**
     * user-defined values
     */
    expect(text.getAttribute('text')).toBe('hello');
    expect(text.getAttribute('fontFamily')).toBe('PingFang SC');
    expect(text.getAttribute('fontSize')).toBe('');
    expect(text.getAttribute('fontWeight')).toBe('');
    expect(text.getAttribute('fontStyle')).toBe('');
    expect(text.getAttribute('fontVariant')).toBe('');
    expect(text.getAttribute('textAlign')).toBe('');
    expect(text.getAttribute('textBaseline')).toBe('');
    expect(text.getAttribute('fill')).toBe('black');
    expect(text.getAttribute('stroke')).toBe('');
    expect(text.getAttribute('letterSpacing')).toBe('');
    expect(text.getAttribute('lineHeight')).toBe('');
    expect(text.getAttribute('lineWidth')).toBe('');
    expect(text.getAttribute('miterLimit')).toBe('');
    // expect(text.getAttribute('whiteSpace')).toBe('pre');
    expect(text.getAttribute('wordWrap')).toBe(false);
    expect(text.getAttribute('leading')).toBe(0);
    expect(text.getAttribute('dx')).toBe('');
    expect(text.getAttribute('dy')).toBe('');

    /**
     * computed values
     */
    const styleMap = text.computedStyleMap();
    // user-defined
    expect(styleMap.get('text')).toBe('hello');
    expect(styleMap.get('fontFamily')).toBe('PingFang SC');
    const fontSize = styleMap.get('fontSize') as CSSKeywordValue;
    expect(fontSize instanceof CSSKeywordValue).toBeTruthy();
    expect(fontSize.value).toBe('unset');
    const fontWeight = styleMap.get('fontWeight') as CSSKeywordValue;
    expect(fontWeight instanceof CSSKeywordValue).toBeTruthy();
    expect(fontWeight.value).toBe('unset');
    const fontStyle = styleMap.get('fontStyle') as CSSKeywordValue;
    expect(fontStyle instanceof CSSKeywordValue).toBeTruthy();
    expect(fontStyle.value).toBe('unset');
    const fontVariant = styleMap.get('fontVariant') as CSSKeywordValue;
    expect(fontVariant instanceof CSSKeywordValue).toBeTruthy();
    expect(fontVariant.value).toBe('unset');
    const textAlign = styleMap.get('textAlign') as CSSKeywordValue;
    expect(textAlign instanceof CSSKeywordValue).toBeTruthy();
    expect(textAlign.value).toBe('unset');
    const textBaseline = styleMap.get('textBaseline') as CSSKeywordValue;
    expect(textBaseline instanceof CSSKeywordValue).toBeTruthy();
    expect(textBaseline.value).toBe('unset');

    /**
     * used values
     */
    let parsedStyle = text.parsedStyle;
    expect(parsedStyle.fill instanceof CSSRGB).toBeTruthy();
    expect((parsedStyle.fill as CSSRGB).r).toBe(0);
    expect((parsedStyle.fill as CSSRGB).g).toBe(0);
    expect((parsedStyle.fill as CSSRGB).b).toBe(0);
    expect((parsedStyle.fill as CSSRGB).alpha).toBe(1);
    expect(parsedStyle.stroke instanceof CSSRGB).toBeTruthy();
    expect((parsedStyle.stroke as CSSRGB).r).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).g).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).b).toBe(0);
    expect((parsedStyle.stroke as CSSRGB).alpha).toBe(0);
    // these inheritable props should get re-calculated after appended to document
    expect(parsedStyle.fillOpacity).toBeUndefined();
    expect(parsedStyle.strokeOpacity).toBeUndefined();
    expect(parsedStyle.lineCap).toBeUndefined();
    expect(parsedStyle.lineJoin).toBeUndefined();
    expect(parsedStyle.visibility).toBeUndefined();
    expect(parsedStyle.fontWeight).toBeUndefined();
    expect(parsedStyle.fontStyle).toBeUndefined();
    expect(parsedStyle.fontVariant).toBeUndefined();
    expect(parsedStyle.textAlign).toBeUndefined();
    expect(parsedStyle.textBaseline).toBeUndefined();

    await canvas.ready;
    /**
     * append it to document
     */
    canvas.appendChild(text);

    parsedStyle = text.parsedStyle;
    // inherit from document.documentElement
    expect(parsedStyle.fillOpacity).toBe(1);
    expect(parsedStyle.strokeOpacity).toBe(1);
    expect(parsedStyle.lineCap).toBe('butt');
    expect(parsedStyle.lineJoin).toBe('miter');
    expect(parsedStyle.visibility).toBe('visible');
    expect(parsedStyle.text).toBe('hello');
    expect(parsedStyle.fontFamily).toBe('PingFang SC');
    expect(parsedStyle.fontSize).toBe(16);
    expect(parsedStyle.fontWeight).toBe('normal');
    expect(parsedStyle.fontVariant).toBe('normal');
    expect(parsedStyle.fontStyle).toBe('normal');
    expect(parsedStyle.textAlign).toBe('start');
    expect(parsedStyle.textBaseline).toBe('alphabetic');
    expect(parsedStyle.textTransform).toBe('none');
  });
});

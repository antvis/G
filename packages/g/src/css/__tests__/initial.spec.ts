import chai, { expect } from 'chai';
import { Circle, Ellipse, Rect, Image, CSS, CSSUnitValue, CSSKeywordValue, CSSRGB } from '../..';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/factory_functions
 */
describe('StyleValueRegistry initialization', () => {
  it('should parse & compute CSS properties for Circle correctly.', () => {
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
    const parsedStyle = circle.parsedStyle;
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
    expect(parsedStyle.strokeOpacity).to.be.undefined;
    expect(parsedStyle.visibility).to.be.undefined;
    // @ts-ignore
    expect(parsedStyle.xxxxx).to.be.undefined;
  });

  it('should parse & compute CSS properties for Ellipse correctly.', () => {
    const ellipse = new Ellipse({
      style: {
        rx: 200,
        ry: '100px',
        fill: 'transparent',
        lineWidth: 2,
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
    expect((parsedStyle.x as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((parsedStyle.y as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((parsedStyle.z as CSSUnitValue).equals(CSS.px(0))).to.be.true;
    expect((parsedStyle.rx as CSSUnitValue).equals(CSS.px(200))).to.be.true;
    expect((parsedStyle.ry as CSSUnitValue).equals(CSS.px(100))).to.be.true;
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
    expect((parsedStyle.opacity as CSSUnitValue).equals(CSS.number(0.5))).to.be.true;
    expect((parsedStyle.fillOpacity as CSSUnitValue).equals(CSS.number(0.5))).to.be.true;
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
});

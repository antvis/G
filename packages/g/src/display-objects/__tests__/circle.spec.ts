import { Circle, CSS, CSSKeywordValue, CSSRGB } from '@antv/g';
import { expect } from 'chai';
import { vec3 } from 'gl-matrix';

describe('Circle', () => {
  it("should calc Circle's GeometryBounds, RenderBounds, Bounds and LocalBounds correctly", () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });

    expect(circle.matches('[cx=100]')).to.be.true;
    expect(circle.matches('[cy=100]')).to.be.true;
    expect(circle.matches('[r=100]')).to.be.true;
    expect(circle.matches('[cx=200]')).to.be.false;

    expect(circle.getAttributeNames()).to.eqls([
      'anchor',
      'opacity',
      'fillOpacity',
      'strokeOpacity',
      'fill',
      'stroke',
      'transform',
      'transformOrigin',
      'visibility',
      'pointerEvents',
      'lineWidth',
      'lineCap',
      'lineJoin',
      'increasedLineWidthForHitTesting',
      'fontSize',
      'fontFamily',
      'fontStyle',
      'fontWeight',
      'fontVariant',
      'textAlign',
      'textBaseline',
      'textTransform',
      'zIndex',
      'cx',
      'cy',
      'r',
    ]);
    expect(circle.hasAttribute('r')).to.be.true;
    expect(circle.hasAttributes()).to.be.true;

    let bounds = circle.getBounds();
    const localBounds = circle.getLocalBounds();
    let geometryBounds = circle.getGeometryBounds();
    const renderBounds = circle.getRenderBounds();
    const bbox = circle.getBBox();

    expect(bbox.x).to.eqls(0);
    expect(bbox.y).to.eqls(0);
    expect(bbox.width).to.eqls(200);
    expect(bbox.height).to.eqls(200);

    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    circle.translate(100);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }

    // change anchor from center to left-top corner, r = 10
    circle.style.anchor = [0, 0];
    expect(circle.getLocalPosition()).eqls(vec3.fromValues(200, 100, 0));
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(210, 110, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(10, 10, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }

    circle.style.anchor = [1, 1];
    expect(circle.getLocalPosition()).eqls(vec3.fromValues(200, 100, 0));
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(190, 90, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(-10, -10, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }

    // ignore undefined
    circle.setAttribute('r', undefined);
    circle.style.r = undefined;
    expect(circle.style.r).to.be.eqls(10);

    circle.removeAttribute('r');
    expect(circle.getAttribute('r')).to.be.null;

    circle.removeAttribute('fill');
    expect(circle.getAttribute('fill')).to.be.null;

    circle.removeAttribute('stroke');
    expect(circle.getAttribute('stroke')).to.be.null;

    circle.removeAttribute('opacity');
    expect(circle.getAttribute('opacity')).to.be.null;
  });

  it("should reset Circle's default values correctly", () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });

    expect(circle.getAttributeNames()).to.eqls([
      'anchor',
      'opacity',
      'fillOpacity',
      'strokeOpacity',
      'fill',
      'stroke',
      'transform',
      'transformOrigin',
      'visibility',
      'pointerEvents',
      'lineWidth',
      'lineCap',
      'lineJoin',
      'increasedLineWidthForHitTesting',
      'fontSize',
      'fontFamily',
      'fontStyle',
      'fontWeight',
      'fontVariant',
      'textAlign',
      'textBaseline',
      'textTransform',
      'zIndex',
      'cx',
      'cy',
      'r',
    ]);

    expect(circle.getAttribute('anchor')).to.be.eqls('');
    expect(circle.parsedStyle.anchor).to.be.eqls([CSS.px(0.5), CSS.px(0.5)]);
    expect(circle.getAttribute('opacity')).to.be.eqls('');
    expect(circle.parsedStyle.opacity).to.be.eqls(CSS.number(1));
    expect(circle.getAttribute('fillOpacity')).to.be.eqls('');
    expect(circle.parsedStyle.fillOpacity).to.be.undefined;
    expect(circle.getAttribute('strokeOpacity')).to.be.eqls('');
    expect(circle.parsedStyle.strokeOpacity).to.be.undefined;
    expect(circle.getAttribute('fill')).to.be.eqls('');
    expect(circle.parsedStyle.fill).to.be.eqls(new CSSRGB(0, 0, 0, 0, true)); // transparent
    expect(circle.getAttribute('stroke')).to.be.eqls('');
    expect(circle.parsedStyle.stroke).to.be.eqls(new CSSRGB(0, 0, 0, 0, true)); // transparent
    expect(circle.getAttribute('transform')).to.be.eqls('');
    expect(circle.parsedStyle.transform).to.be.eqls(new CSSKeywordValue('none'));
    expect(circle.getAttribute('transformOrigin')).to.be.eqls('');
    expect(circle.parsedStyle.transformOrigin).to.be.eqls([CSS.percent(50), CSS.percent(50)]);
    expect(circle.getAttribute('visibility')).to.be.eqls('');
    expect(circle.parsedStyle.visibility).to.be.undefined;
    expect(circle.getAttribute('pointerEvents')).to.be.eqls('');
    expect(circle.parsedStyle.pointerEvents).to.be.undefined;
    expect(circle.getAttribute('lineWidth')).to.be.eqls('');
    expect(circle.parsedStyle.lineWidth).to.be.undefined;
    expect(circle.getAttribute('lineJoin')).to.be.eqls('');
    expect(circle.parsedStyle.lineJoin).to.be.undefined;
    expect(circle.getAttribute('lineCap')).to.be.eqls('');
    expect(circle.parsedStyle.lineCap).to.be.undefined;
    expect(circle.getAttribute('increasedLineWidthForHitTesting')).to.be.eqls('');
    expect(circle.parsedStyle.increasedLineWidthForHitTesting).to.be.undefined;
    expect(circle.getAttribute('fontSize')).to.be.eqls('');
    expect(circle.parsedStyle.fontSize).to.be.undefined;
    expect(circle.getAttribute('zIndex')).to.be.eqls('');
    expect(circle.parsedStyle.zIndex).to.be.eqls(CSS.number(0));
    expect(circle.getAttribute('cx')).to.be.eqls(100);
    expect(circle.parsedStyle.cx).to.be.eqls(CSS.px(100));
    expect(circle.getAttribute('cy')).to.be.eqls(100);
    expect(circle.parsedStyle.cy).to.be.eqls(CSS.px(100));
    expect(circle.getAttribute('r')).to.be.eqls(100);
    expect(circle.parsedStyle.r).to.be.eqls(CSS.px(100));

    // update anchor
    circle.style.anchor = '0 0';
    expect(circle.getAttribute('anchor')).to.be.eqls('0 0');
    expect(circle.parsedStyle.anchor).to.be.eqls([CSS.px(0), CSS.px(0)]);
    // update fill
    circle.style.fill = 'red';
    expect(circle.getAttribute('fill')).to.be.eqls('red');
    expect(circle.parsedStyle.fill).to.be.eqls(new CSSRGB(255, 0, 0));
    // update transform
    circle.style.transform = 'scale(1)';
    expect(circle.getAttribute('transform')).to.be.eqls('scale(1)');
    // update zIndex
    circle.style.zIndex = 10;
    expect(circle.getAttribute('zIndex')).to.be.eqls(10);

    // reset all attributes
    circle.getAttributeNames().forEach((attributeName: string) => {
      circle.setAttribute(attributeName, '');
    });

    expect(circle.getAttribute('anchor')).to.be.eqls('');
    expect(circle.parsedStyle.anchor).to.be.eqls([CSS.px(0.5), CSS.px(0.5)]);
    expect(circle.getAttribute('opacity')).to.be.eqls('');
    expect(circle.parsedStyle.opacity).to.be.eqls(CSS.number(1));
    expect(circle.getAttribute('fillOpacity')).to.be.eqls('');
    expect(circle.parsedStyle.fillOpacity).to.be.undefined;
    expect(circle.getAttribute('strokeOpacity')).to.be.eqls('');
    expect(circle.parsedStyle.strokeOpacity).to.be.undefined;
    expect(circle.getAttribute('fill')).to.be.eqls('');
    expect(circle.parsedStyle.fill).to.be.eqls(new CSSRGB(0, 0, 0, 0, true)); // transparent
    expect(circle.getAttribute('stroke')).to.be.eqls('');
    expect(circle.parsedStyle.stroke).to.be.eqls(new CSSRGB(0, 0, 0, 0, true)); // transparent
    expect(circle.getAttribute('transform')).to.be.eqls('');
    expect(circle.parsedStyle.transform).to.be.eqls(new CSSKeywordValue('none'));
    expect(circle.getAttribute('transformOrigin')).to.be.eqls('');
    expect(circle.parsedStyle.transformOrigin).to.be.eqls([CSS.percent(50), CSS.percent(50)]);
    expect(circle.getAttribute('visibility')).to.be.eqls('');
    expect(circle.parsedStyle.visibility).to.be.undefined;
    expect(circle.getAttribute('pointerEvents')).to.be.eqls('');
    expect(circle.parsedStyle.pointerEvents).to.be.undefined;
    expect(circle.getAttribute('lineWidth')).to.be.eqls('');
    expect(circle.parsedStyle.lineWidth).to.be.undefined;
    expect(circle.getAttribute('lineJoin')).to.be.eqls('');
    expect(circle.parsedStyle.lineJoin).to.be.undefined;
    expect(circle.getAttribute('lineCap')).to.be.eqls('');
    expect(circle.parsedStyle.lineCap).to.be.undefined;
    expect(circle.getAttribute('zIndex')).to.be.eqls('');
    expect(circle.parsedStyle.zIndex).to.be.eqls(CSS.number(0));
    expect(circle.getAttribute('cx')).to.be.eqls('');
    expect(circle.parsedStyle.cx).to.be.eqls(CSS.px(0));
    expect(circle.getAttribute('cy')).to.be.eqls('');
    expect(circle.parsedStyle.cy).to.be.eqls(CSS.px(0));
    expect(circle.getAttribute('r')).to.be.eqls('');
    expect(circle.parsedStyle.r).to.be.eqls(CSS.px(0));
  });
});

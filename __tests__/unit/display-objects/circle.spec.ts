import { Circle, CSS, CSSRGB } from '../../../packages/g/src';

describe('Circle', () => {
  it("should calc Circle's GeometryBounds, RenderBounds, Bounds and LocalBounds correctly", () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });

    expect(circle.matches('[cx=100]')).toBeTruthy();
    expect(circle.matches('[cy=100]')).toBeTruthy();
    expect(circle.matches('[r=100]')).toBeTruthy();
    expect(circle.matches('[cx=200]')).toBeFalsy();

    expect(circle.getAttributeNames()).toStrictEqual([
      // 'opacity',
      // 'fillOpacity',
      // 'strokeOpacity',
      // 'fill',
      // 'stroke',
      // 'transform',
      // 'transformOrigin',
      // 'visibility',
      // 'pointerEvents',
      // 'lineWidth',
      // 'lineCap',
      // 'lineJoin',
      // 'increasedLineWidthForHitTesting',
      // 'fontSize',
      // 'fontFamily',
      // 'fontStyle',
      // 'fontWeight',
      // 'fontVariant',
      // 'textAlign',
      // 'textBaseline',
      // 'textTransform',
      // 'zIndex',
      // 'filter',
      // 'shadowType',
      'cx',
      'cy',
      'r',
    ]);
    expect(circle.hasAttribute('r')).toBeTruthy();
    expect(circle.hasAttributes()).toBeTruthy();

    let bounds = circle.getBounds();
    const localBounds = circle.getLocalBounds();
    let geometryBounds = circle.getGeometryBounds();
    const renderBounds = circle.getRenderBounds();
    const bbox = circle.getBBox();

    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(200);

    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([100, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([100, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle.translate(100);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }

    // ignore undefined
    // @ts-ignore
    circle.setAttribute('r', undefined);
    // @ts-ignore
    circle.style.r = undefined;
    expect(circle.style.r).toBe(10);

    circle.removeAttribute('r');
    expect(circle.getAttribute('r')).toBeUndefined();

    circle.removeAttribute('fill');
    expect(circle.getAttribute('fill')).toBeUndefined();

    circle.removeAttribute('stroke');
    expect(circle.getAttribute('stroke')).toBeUndefined();

    circle.removeAttribute('opacity');
    expect(circle.getAttribute('opacity')).toBeUndefined();
  });

  it("should reset Circle's default values correctly", () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });

    expect(circle.getAttributeNames()).toStrictEqual([
      // 'opacity',
      // 'fillOpacity',
      // 'strokeOpacity',
      // 'fill',
      // 'stroke',
      // 'transform',
      // 'transformOrigin',
      // 'visibility',
      // 'pointerEvents',
      // 'lineWidth',
      // 'lineCap',
      // 'lineJoin',
      // 'increasedLineWidthForHitTesting',
      // 'fontSize',
      // 'fontFamily',
      // 'fontStyle',
      // 'fontWeight',
      // 'fontVariant',
      // 'textAlign',
      // 'textBaseline',
      // 'textTransform',
      // 'zIndex',
      // 'filter',
      // 'shadowType',
      'cx',
      'cy',
      'r',
    ]);

    // expect(circle.getAttribute('opacity')).toBe('');
    expect(circle.parsedStyle.opacity).toBeUndefined();
    // expect(circle.getAttribute('fillOpacity')).toBe('');
    expect(circle.parsedStyle.fillOpacity).toBeUndefined();
    // expect(circle.getAttribute('strokeOpacity')).toBe('');
    expect(circle.parsedStyle.strokeOpacity).toBeUndefined();
    // expect(circle.getAttribute('fill')).toBe('');
    // expect(circle.parsedStyle.fill?.toString()).toStrictEqual(
    //   new CSSRGB(0, 0, 0, 0, true).toString(),
    // ); // transparent
    // expect(circle.getAttribute('stroke')).toBe('');
    // expect(circle.parsedStyle.stroke?.toString()).toStrictEqual(
    //   new CSSRGB(0, 0, 0, 0, true).toString(),
    // ); // transparent
    // expect(circle.getAttribute('transform')).toBe('');
    // expect(circle.parsedStyle.transform).toStrictEqual([]);
    // expect(circle.getAttribute('transformOrigin')).toBe('');
    // expect(circle.parsedStyle.transformOrigin).toStrictEqual([
    //   CSS.percent(50),
    //   CSS.percent(50),
    // ]);
    // expect(circle.getAttribute('visibility')).toBe('');
    expect(circle.parsedStyle.visibility).toBeUndefined();
    // expect(circle.getAttribute('pointerEvents')).toBe('');
    expect(circle.parsedStyle.pointerEvents).toBeUndefined();
    // expect(circle.getAttribute('lineWidth')).toBe('');
    expect(circle.parsedStyle.lineWidth).toBeUndefined();
    // expect(circle.getAttribute('lineJoin')).toBe('');
    expect(circle.parsedStyle.lineJoin).toBeUndefined();
    // expect(circle.getAttribute('lineCap')).toBe('');
    expect(circle.parsedStyle.lineCap).toBeUndefined();
    // expect(circle.getAttribute('increasedLineWidthForHitTesting')).toBe('');
    expect(circle.parsedStyle.increasedLineWidthForHitTesting).toBeUndefined();
    // @ts-ignore
    // expect(circle.getAttribute('fontSize')).toBe('');
    // @ts-ignore
    expect(circle.parsedStyle.fontSize).toBeUndefined();
    // expect(circle.getAttribute('zIndex')).toBe('');
    // expect(circle.parsedStyle.zIndex).toBe(0);
    // expect(circle.getAttribute('cx')).toBe(100);
    expect(circle.parsedStyle.cx).toBe(100);
    // expect(circle.getAttribute('cy')).toBe(100);
    expect(circle.parsedStyle.cy).toBe(100);
    // expect(circle.getAttribute('r')).toBe(100);
    expect(circle.parsedStyle.r).toBe(100);

    // update fill
    circle.style.fill = 'red';
    expect(circle.getAttribute('fill')).toBe('red');
    expect(circle.parsedStyle.fill?.toString()).toBe(
      new CSSRGB(255, 0, 0).toString(),
    );
    // update transform
    circle.style.transform = 'scale(1)';
    expect(circle.getAttribute('transform')).toBe('scale(1)');
    // update zIndex
    circle.style.zIndex = 10;
    expect(circle.getAttribute('zIndex')).toBe(10);

    // reset all attributes
    circle.getAttributeNames().forEach((attributeName: string) => {
      // @ts-ignore
      circle.setAttribute(attributeName, '');
    });

    // expect(circle.getAttribute('opacity')).toBe('');
    expect(circle.parsedStyle.opacity).toBeUndefined();
    // expect(circle.getAttribute('fillOpacity')).toBe('');
    expect(circle.parsedStyle.fillOpacity).toBeUndefined();
    // expect(circle.getAttribute('strokeOpacity')).toBe('');
    expect(circle.parsedStyle.strokeOpacity).toBeUndefined();
    // expect(circle.getAttribute('fill')).toBe('');
    // expect(circle.parsedStyle.fill?.toString()).toBe(
    //   new CSSRGB(0, 0, 0, 0, true).toString(),
    // ); // transparent
    // expect(circle.getAttribute('stroke')).toBe('');
    // expect(circle.parsedStyle.stroke?.toString()).toBe(
    //   new CSSRGB(0, 0, 0, 0, true).toString(),
    // ); // transparent
    // expect(circle.getAttribute('transform')).toBe('');
    // expect(circle.parsedStyle.transform).toStrictEqual([]);
    // expect(circle.getAttribute('transformOrigin')).toBe('');
    // expect(circle.parsedStyle.transformOrigin).toStrictEqual([
    //   CSS.percent(50),
    //   CSS.percent(50),
    // ]);
    // expect(circle.getAttribute('visibility')).toBe('');
    expect(circle.parsedStyle.visibility).toBeUndefined();
    // expect(circle.getAttribute('pointerEvents')).toBe('');
    expect(circle.parsedStyle.pointerEvents).toBeUndefined();
    // expect(circle.getAttribute('lineWidth')).toBe('');
    expect(circle.parsedStyle.lineWidth).toBeUndefined();
    // expect(circle.getAttribute('lineJoin')).toBe('');
    expect(circle.parsedStyle.lineJoin).toBeUndefined();
    // expect(circle.getAttribute('lineCap')).toBe('');
    expect(circle.parsedStyle.lineCap).toBeUndefined();
    // expect(circle.getAttribute('zIndex')).toBe('');
    // expect(circle.parsedStyle.zIndex).toBe(0);
    // // expect(circle.getAttribute('cx')).toBe('');
    // expect(circle.parsedStyle.cx).toBe(0);
    // // expect(circle.getAttribute('cy')).toBe('');
    // expect(circle.parsedStyle.cy).toBe(0);
    // // expect(circle.getAttribute('r')).toBe('');
    // expect(circle.parsedStyle.r).toBe(0);
  });
});

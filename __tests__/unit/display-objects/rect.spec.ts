import { Rect } from '../../../packages/g/src';

describe('Rect', () => {
  it("should calc Rect's GeometryBounds, RenderBounds, Bounds and LocalBounds correctly", () => {
    const rect = new Rect({
      style: {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      },
    });

    expect(rect.matches('[x=0]')).toBeTruthy();
    expect(rect.matches('[y=0]')).toBeTruthy();
    expect(rect.matches('[width=200]')).toBeTruthy();
    expect(rect.matches('[height=200]')).toBeTruthy();
    expect(rect.matches('[x=200]')).toBeFalsy();

    expect(rect.getAttributeNames()).toStrictEqual([
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
      'x',
      'y',
      'width',
      'height',
      // 'radius',
    ]);
    expect(rect.hasAttribute('width')).toBeTruthy();
    expect(rect.hasAttributes()).toBeTruthy();

    let bounds = rect.getBounds();
    let localBounds = rect.getLocalBounds();
    let geometryBounds = rect.getGeometryBounds();
    let renderBounds = rect.getRenderBounds();
    let bbox = rect.getBBox();

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

    // model matrix changed
    rect.translate(100);
    bounds = rect.getBounds();
    localBounds = rect.getLocalBounds();
    geometryBounds = rect.getGeometryBounds();
    renderBounds = rect.getRenderBounds();
    bbox = rect.getBBox();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    expect(bbox.x).toBe(100);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(200);

    // lineWidth
    rect.setAttribute('lineWidth', 10);
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    // radius
    rect.setAttribute('radius', '10 20');
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });

  it("should support Rect's negative width & height", () => {
    const rect = new Rect({
      style: {
        x: 0,
        y: 0,
        width: -200,
        height: 200,
      },
    });

    let bounds = rect.getBounds();
    let localBounds = rect.getLocalBounds();
    let geometryBounds = rect.getGeometryBounds();
    let renderBounds = rect.getRenderBounds();
    let bbox = rect.getBBox();

    expect(bbox.x).toBe(-200);
    expect(bbox.y).toBe(0);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(200);

    if (bounds) {
      expect(bounds.center).toStrictEqual([-100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([-100, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([-100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([-100, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    // negative height
    rect.style.height = -200;
    bounds = rect.getBounds();
    localBounds = rect.getLocalBounds();
    geometryBounds = rect.getGeometryBounds();
    renderBounds = rect.getRenderBounds();
    bbox = rect.getBBox();
    expect(bbox.x).toBe(-200);
    expect(bbox.y).toBe(-200);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(200);

    if (bounds) {
      expect(bounds.center).toStrictEqual([-100, -100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([-100, -100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([-100, -100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([-100, -100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });
});

import { Circle, Group, Rect } from '../../../packages/g/src';

describe('DisplayObject Bounds API', () => {
  it('should calc GeometryBounds, RenderBounds, Bounds, LocalBounds correctly', () => {
    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        stroke: 'red',
      },
    });
    let bounds = circle.getBounds();
    let localBounds = circle.getLocalBounds();
    let geometryBounds = circle.getGeometryBounds();
    let renderBounds = circle.getRenderBounds();

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
      expect(renderBounds.halfExtents).toStrictEqual([100.5, 100.5, 0]);
    }

    circle.translate(100);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100.5, 100.5, 0]);
    }

    // change line width
    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      // r + halfLineWith
      expect(renderBounds.halfExtents).toStrictEqual([105, 105, 0]);
    }

    // increasedLineWidthForHitTesting
    circle.setAttribute('increasedLineWidthForHitTesting', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      // r + halfLineWith
      expect(renderBounds.halfExtents).toStrictEqual([110, 110, 0]);
    }
    circle.setAttribute('increasedLineWidthForHitTesting', 0);

    // change r
    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([15, 15, 0]);
    }

    // add shadow
    circle.style.shadowColor = 'black';
    circle.style.shadowBlur = 20;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      // r + shadowBlur + halfLineWidth
      expect(renderBounds.halfExtents).toStrictEqual([35, 35, 0]);
    }
    circle.style.shadowOffsetX = 10;
    circle.style.shadowOffsetY = 10;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).toStrictEqual([200, 100, 0]);
      expect(localBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      // offset bounds' center
      expect(renderBounds.center).toStrictEqual([210, 110, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([35, 35, 0]);
    }

    // remove shadow
    circle.style.shadowColor = 'transparent';
    circle.style.shadowBlur = 0;
    circle.style.shadowOffsetX = 0;
    circle.style.shadowOffsetY = 0;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([15, 15, 0]);
    }

    // add filters
    circle.style.filter = 'blur(10px)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).toStrictEqual([25, 25, 0]);
    }

    // clear filters
    circle.style.filter = 'none';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([200, 100, 0]);
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).toStrictEqual([15, 15, 0]);
    }

    // add drop-shadow filter
    circle.style.filter = 'drop-shadow(10px 10px 10px black)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([10, 10, 0]);
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([210, 110, 0]);
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).toStrictEqual([25, 25, 0]);
    }
  });

  it("should calc Rect's bounds correctly", () => {
    const rect = new Rect({
      style: {
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      },
    });
    let bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    // use clipPath
    const clipPath = new Circle({
      style: {
        cx: 200,
        cy: 200,
        r: 20,
        transformOrigin: '200 200',
      },
    });
    // clipped by Circle
    rect.style.clipPath = clipPath;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([20, 20, 0]);
    }

    // change clip path
    clipPath.style.r = 40;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([40, 40, 0]);
    }

    // transform clip path
    clipPath.style.transform = 'scale(0.5)';
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([20, 20, 0]);
    }

    // use transform API
    clipPath.scale(2);
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([40, 40, 0]);
    }

    // clear clip path
    rect.style.clipPath = null;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    bounds = rect.getRenderBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([200, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });

  it("should calc Group's bounds correctly", () => {
    const group = new Group();
    let bounds = group.getBounds();
    let geometryBounds = group.getGeometryBounds();
    let renderBounds = group.getRenderBounds();
    expect(bounds.center).toStrictEqual([0, 0, 0]);
    expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);
    expect(geometryBounds.center).toStrictEqual([0, 0, 0]);
    expect(geometryBounds.halfExtents).toStrictEqual([0, 0, 0]);
    expect(renderBounds.center).toStrictEqual([0, 0, 0]);
    expect(renderBounds.halfExtents).toStrictEqual([0, 0, 0]);

    const circle = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });
    group.appendChild(circle);

    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    geometryBounds = group.getGeometryBounds();
    expect(geometryBounds.center).toStrictEqual([0, 0, 0]);
    expect(geometryBounds.halfExtents).toStrictEqual([0, 0, 0]);
    renderBounds = group.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([100, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    // change circle's radius
    circle.style.r = 200;
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 200, 0]);
    }
    geometryBounds = group.getGeometryBounds();
    expect(geometryBounds.center).toStrictEqual([0, 0, 0]);
    expect(geometryBounds.halfExtents).toStrictEqual([0, 0, 0]);
    renderBounds = group.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([100, 100, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([200, 200, 0]);
    }

    // apply clipPath to Group
    group.style.clipPath = new Rect({ style: { width: 100, height: 100 } });
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 200, 0]);
    }
    geometryBounds = group.getGeometryBounds();
    expect(geometryBounds.center).toStrictEqual([0, 0, 0]);
    expect(geometryBounds.halfExtents).toStrictEqual([0, 0, 0]);
    renderBounds = group.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([50, 50, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([50, 50, 0]);
    }

    // child should be clipped also
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 200, 0]);
    }
    bounds = circle.getLocalBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([100, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 200, 0]);
    }
    geometryBounds = circle.getGeometryBounds();
    expect(geometryBounds.center).toStrictEqual([100, 100, 0]);
    expect(geometryBounds.halfExtents).toStrictEqual([200, 200, 0]);
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).toStrictEqual([50, 50, 0]);
      expect(renderBounds.halfExtents).toStrictEqual([50, 50, 0]);
    }
  });

  it('should calc merged global bounds correctly', () => {
    const group = new Group();
    // group has no bounds
    let bounds = group.getBounds();
    expect(bounds.center).toStrictEqual([0, 0, 0]);
    expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);

    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
      },
    });

    const circle2 = new Circle({
      style: {
        cx: 200,
        cy: 100,
        r: 100,
      },
    });

    // 2 circles
    group.appendChild(circle1);
    group.appendChild(circle2);
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([150, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([150, 100, 0]);
    }

    // translate group
    group.translate(100);
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([250, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([150, 100, 0]);
    }

    let circle1Bounds = circle1.getBounds();
    let circle1LocalBounds = circle1.getLocalBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([200, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    // translate circle1
    circle1.translateLocal(100);
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([300, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([200, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
    // 2 circles overlap now
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([300, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });

  it('should update geometry when stroke changed from `none` to `red`.', () => {
    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        lineWidth: 20,
      },
    });

    let circle1Bounds = circle1.getBounds();
    let circle1LocalBounds = circle1.getLocalBounds();
    let circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle1.style.stroke = 'red';
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([110, 110, 0]);
    }

    circle1.style.stroke = 'none';
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });

  it('should update geometry when stroke changed from `none` to `red`.', () => {
    const circle1 = new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 100,
        lineWidth: 20,
      },
    });

    let circle1Bounds = circle1.getBounds();
    let circle1LocalBounds = circle1.getLocalBounds();
    let circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }

    circle1.style.stroke = 'red';
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([110, 110, 0]);
    }

    circle1.style.stroke = 'none';
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    circle1RenderBounds = circle1.getRenderBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1Bounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1LocalBounds.halfExtents).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.center).toStrictEqual([100, 100, 0]);
      expect(circle1RenderBounds.halfExtents).toStrictEqual([100, 100, 0]);
    }
  });
});

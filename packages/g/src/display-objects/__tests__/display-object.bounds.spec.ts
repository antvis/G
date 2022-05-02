import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Rect, Circle, Group } from '@antv/g';
import { vec3 } from 'gl-matrix';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DisplayObject Bounds API', () => {
  it('should calc GeometryBounds, RenderBounds, Bounds, LocalBounds correctly', () => {
    const circle = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
      },
    });
    let bounds = circle.getBounds();
    let localBounds = circle.getLocalBounds();
    let geometryBounds = circle.getGeometryBounds();
    let renderBounds = circle.getRenderBounds();

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
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // change line width
    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      // r + halfLineWith
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(105, 105, 0));
    }

    // change r
    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(15, 15, 0));
    }

    // add shadow
    circle.style.shadowColor = 'black';
    circle.style.shadowBlur = 20;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      // r + shadowBlur + halfLineWidth
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(35, 35, 0));
    }
    circle.style.shadowOffsetX = 10;
    circle.style.shadowOffsetY = 10;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    localBounds = circle.getLocalBounds();
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      // offset bounds' center
      expect(renderBounds.center).eqls(vec3.fromValues(210, 110, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(35, 35, 0));
    }

    // remove shadow
    circle.style.shadowColor = 'transparent';
    circle.style.shadowBlur = 0;
    circle.style.shadowOffsetX = 0;
    circle.style.shadowOffsetY = 0;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(15, 15, 0));
    }

    // add filters
    circle.style.filter = 'blur(10px)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    geometryBounds = circle.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(25, 25, 0));
    }

    // clear filters
    circle.style.filter = 'none';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(15, 15, 0));
    }

    // add drop-shadow filter
    circle.style.filter = 'drop-shadow(10px 10px 10px black)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(10, 10, 0));
    }
    renderBounds = circle.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(210, 110, 0));
      // blur + halfLineWidth
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(25, 25, 0));
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
      expect(bounds.center).eqls(vec3.fromValues(200, 200, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // modify anchor
    rect.style.anchor = [0.5, 0.5];
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // use clipPath
    const clipPath = new Circle({
      style: {
        r: 20,
      },
    });
    // clipped by Circle
    rect.style.clipPath = clipPath;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(20, 20, 0));
    }

    // change clip path
    clipPath.style.r = 40;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(40, 40, 0));
    }

    // clear clip path
    rect.style.clipPath = null;
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
  });

  it("should calc Group's bounds correctly", () => {
    const group = new Group();
    let bounds = group.getBounds();
    let geometryBounds = group.getGeometryBounds();
    let renderBounds = group.getRenderBounds();
    expect(bounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));
    expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(geometryBounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));
    expect(renderBounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(renderBounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));

    const circle = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
      },
    });
    group.appendChild(circle);

    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    geometryBounds = group.getGeometryBounds();
    expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(geometryBounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));
    renderBounds = group.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // change circle's radius
    circle.style.r = 200;
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(200, 200, 0));
    }
    geometryBounds = group.getGeometryBounds();
    expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(geometryBounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));
    renderBounds = group.getRenderBounds();
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(200, 200, 0));
    }
  });

  it('should calc merged global bounds correctly', () => {
    const group = new Group();
    // group has no bounds
    let bounds = group.getBounds();
    expect(bounds.center).eqls(vec3.fromValues(0, 0, 0));
    expect(bounds.halfExtents).eqls(vec3.fromValues(0, 0, 0));

    const circle1 = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
      },
    });

    const circle2 = new Circle({
      style: {
        x: 200,
        y: 100,
        r: 100,
      },
    });

    // 2 circles
    group.appendChild(circle1);
    group.appendChild(circle2);
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(150, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(150, 100, 0));
    }

    // translate group
    group.translate(100);
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(250, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(150, 100, 0));
    }

    let circle1Bounds = circle1.getBounds();
    let circle1LocalBounds = circle1.getLocalBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(circle1Bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
      expect(circle1LocalBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(circle1LocalBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // translate circle1
    circle1.translateLocal(100);
    circle1Bounds = circle1.getBounds();
    circle1LocalBounds = circle1.getLocalBounds();
    if (circle1Bounds && circle1LocalBounds) {
      expect(circle1Bounds.center).eqls(vec3.fromValues(300, 100, 0));
      expect(circle1Bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
      expect(circle1LocalBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(circle1LocalBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    // 2 circles overlap now
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(300, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
  });
});

import { expect } from 'chai';
import { Circle } from '../..';
import { vec3 } from 'gl-matrix';

describe('Circle', () => {
  it("should calc Circle's GeometryBounds, RenderBounds, Bounds and LocalBounds correctly", () => {
    const circle = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
      },
    });

    expect(circle.getAttributeNames()).to.eqls([
      'x',
      'y',
      'z',
      'anchor',
      // 'origin',
      'opacity',
      'fillOpacity',
      'strokeOpacity',
      'fill',
      'stroke',
      'transformOrigin',
      'visibility',
      'pointerEvents',
      'lineCap',
      'lineJoin',
      'fontSize',
      'fontFamily',
      'fontStyle',
      'fontWeight',
      'fontVariant',
      'textAlign',
      'textBaseline',
      'textTransform',
      'zIndex',
      'interactive',
      'r',
      'lineWidth',
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
  });
});

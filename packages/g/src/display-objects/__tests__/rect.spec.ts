import { Rect } from '@antv/g';
import { expect } from 'chai';
import { vec3 } from 'gl-matrix';

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

    expect(rect.matches('[x=0]')).to.be.true;
    expect(rect.matches('[y=0]')).to.be.true;
    expect(rect.matches('[width=200]')).to.be.true;
    expect(rect.matches('[height=200]')).to.be.true;
    expect(rect.matches('[x=200]')).to.be.false;

    expect(rect.getAttributeNames()).to.eqls([
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
      'interactive',
      'x',
      'y',
      'width',
      'height',
      'radius',
    ]);
    expect(rect.hasAttribute('width')).to.be.true;
    expect(rect.hasAttributes()).to.be.true;

    let bounds = rect.getBounds();
    let localBounds = rect.getLocalBounds();
    let geometryBounds = rect.getGeometryBounds();
    let renderBounds = rect.getRenderBounds();
    let bbox = rect.getBBox();

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
      expect(geometryBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // model matrix changed
    rect.translate(100);
    bounds = rect.getBounds();
    localBounds = rect.getLocalBounds();
    geometryBounds = rect.getGeometryBounds();
    renderBounds = rect.getRenderBounds();
    bbox = rect.getBBox();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    expect(bbox.x).to.eqls(100);
    expect(bbox.y).to.eqls(0);
    expect(bbox.width).to.eqls(200);
    expect(bbox.height).to.eqls(200);

    // lineWidth
    rect.setAttribute('lineWidth', 10);
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // radius
    rect.setAttribute('radius', '10 20');
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // change anchor from left-top corner to center,
    rect.style.anchor = [0.5, 0.5];
    expect(rect.getLocalPosition()).eqls(vec3.fromValues(100, 0, 0));
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 0, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    geometryBounds = rect.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
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

    expect(bbox.x).to.eqls(-200);
    expect(bbox.y).to.eqls(0);
    expect(bbox.width).to.eqls(200);
    expect(bbox.height).to.eqls(200);

    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(-100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(-100, 100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(-100, 100, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(-100, 100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // negative height
    rect.style.height = -200;
    bounds = rect.getBounds();
    localBounds = rect.getLocalBounds();
    geometryBounds = rect.getGeometryBounds();
    renderBounds = rect.getRenderBounds();
    bbox = rect.getBBox();
    expect(bbox.x).to.eqls(-200);
    expect(bbox.y).to.eqls(-200);
    expect(bbox.width).to.eqls(200);
    expect(bbox.height).to.eqls(200);

    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(-100, -100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (localBounds) {
      expect(localBounds.center).eqls(vec3.fromValues(-100, -100, 0));
      expect(localBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(-100, -100, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    if (renderBounds) {
      expect(renderBounds.center).eqls(vec3.fromValues(-100, -100, 0));
      expect(renderBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    // change anchor from left-top corner to center,
    rect.style.anchor = [0.5, 0.5];
    expect(rect.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));
    bounds = rect.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
    geometryBounds = rect.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(0, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }
  });
});

import { expect } from 'chai';
import { Circle } from '../..';
import { vec3 } from 'gl-matrix';

describe('Circle', () => {
  it('should calc global bounds correctly', () => {
    const circle = new Circle({
      style: {
        x: 100,
        y: 100,
        r: 100,
      },
    });

    let bounds = circle.getBounds();

    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    circle.translate(100);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 100, 0));
    }

    circle.setAttribute('lineAppendWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(110, 110, 0));
    }

    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(120, 120, 0));
    }

    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(30, 30, 0));
    }

    // add shadow
    circle.style.shadowColor = 'black';
    circle.style.shadowBlur = 20;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      // r + shadowBlur = 30 + 20 = 50
      expect(bounds.halfExtents).eqls(vec3.fromValues(50, 50, 0));
    }
    circle.style.shadowOffsetX = 10;
    circle.style.shadowOffsetY = 10;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(210, 110, 0));
      // r + shadowBlur = 30 + 20 = 50
      expect(bounds.halfExtents).eqls(vec3.fromValues(50, 50, 0));
    }

    // remove shadow
    circle.style.shadowColor = 'transparent';
    circle.style.shadowBlur = 0;
    circle.style.shadowOffsetX = 0;
    circle.style.shadowOffsetY = 0;
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(30, 30, 0));
    }

    // add filters
    circle.style.filter = 'blur(10px)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(40, 40, 0));
    }

    // clear filters
    circle.style.filter = 'none';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(30, 30, 0));
    }

    // add drop-shadow filter
    circle.style.filter = 'drop-shadow(10px 10px 10px black)';
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(210, 110, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(40, 40, 0));
    }

    // change anchor from center to left-top corner, r = 10
    circle.style.anchor = [0, 0];
    expect(circle.getLocalPosition()).eqls(vec3.fromValues(200, 100, 0));
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(220, 120, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(40, 40, 0));
    }
    circle.style.anchor = [1, 1];
    expect(circle.getLocalPosition()).eqls(vec3.fromValues(200, 100, 0));
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(40, 40, 0));
    }
  });
});

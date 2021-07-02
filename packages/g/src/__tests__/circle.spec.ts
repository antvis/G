import { expect } from 'chai';
import { Circle } from '..';
import { vec3 } from 'gl-matrix';
import { Group } from '../shapes-export';

describe('Circle', () => {
  it('should calc global bounds correctly', () => {
    const circle = new Circle({
      attrs: {
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
  });

  it('should calc merged global bounds correctly', () => {
    const group = new Group();
    // group has no bounds
    let bounds = group.getBounds();
    expect(bounds).to.be.null;

    const circle1 = new Circle({
      attrs: {
        x: 100,
        y: 100,
        r: 100,
      },
    });

    const circle2 = new Circle({
      attrs: {
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

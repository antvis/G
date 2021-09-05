import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { DisplayObject, Rect, Circle, Group, Line, Polyline, SHAPE } from '..';
import { vec3 } from 'gl-matrix';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('DisplayObject get(Local)Bounds() API', () => {
  it("should calc Circle's bounds correctly", () => {
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

    // change line width
    circle.setAttribute('lineWidth', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(120, 120, 0));
    }

    // change r
    circle.setAttribute('r', 10);
    bounds = circle.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(200, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(30, 30, 0));
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
    expect(bounds).to.be.null;

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

    // change circle's radius
    circle.style.r = 200;
    bounds = group.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(100, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(200, 200, 0));
    }
  });

  it('should calc merged global bounds correctly', () => {
    const group = new Group();
    // group has no bounds
    let bounds = group.getBounds();
    expect(bounds).to.be.null;

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

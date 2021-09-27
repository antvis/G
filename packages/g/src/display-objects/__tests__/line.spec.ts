import { expect } from 'chai';
import { Line } from '../..';
import { vec3 } from 'gl-matrix';

describe('Line', () => {
  it('should calc global bounds correctly', () => {
    const line = new Line({
      style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        lineWidth: 10,
      },
    });

    // get local position
    expect(line.getLocalPosition()).eqls(vec3.fromValues(200, 100, 0));

    // get length
    expect(line.getTotalLength()).eqls(200);

    // get bounds
    let bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(300, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }
    let geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(100, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }

    // change lineWidth
    line.style.lineWidth = 20;
    bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(300, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }
    geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(100, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }

    // change x1/x2, move right
    line.style.x1 += 100;
    line.style.x2 += 100;
    expect(line.getLocalPosition()).eqls(vec3.fromValues(300, 100, 0));
    expect(line.getTotalLength()).eqls(200);
    bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(400, 100, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }
    geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).eqls(vec3.fromValues(100, 0, 0));
      expect(geometryBounds.halfExtents).eqls(vec3.fromValues(100, 0, 0));
    }
  });

  it('should compare with initial x1 when x1 changed', () => {
    const line = new Line({
      style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        lineWidth: 10,
      },
    });

    // move right 100px
    line.translate(100, 0);
    expect(line.getLocalPosition()).eqls(vec3.fromValues(300, 100, 0));

    // change x1 now, should
    line.style.x1 += 100;
    line.style.x2 += 100;
    expect(line.getLocalPosition()).eqls(vec3.fromValues(400, 100, 0));
  });

  it('should getPoint at ratio correctly', () => {
    const line = new Line({
      style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        lineWidth: 10,
      },
    });

    let point = line.getPoint(0);
    expect(point.x).eqls(200);
    expect(point.y).eqls(100);

    point = line.getPoint(0.5);
    expect(point.x).eqls(300);
    expect(point.y).eqls(100);

    point = line.getPoint(1);
    expect(point.x).eqls(400);
    expect(point.y).eqls(100);
  });
});

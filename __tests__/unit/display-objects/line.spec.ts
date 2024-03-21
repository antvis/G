import { Circle, Line } from '../../../packages/g/src';

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
    expect(line.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // get length
    expect(line.getTotalLength()).toBe(200);

    // get bounds
    let bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([300, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 0, 0]);
    }
    let geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([300, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 0, 0]);
    }

    // change lineWidth
    line.style.lineWidth = 20;
    bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([300, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 0, 0]);
    }
    geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([300, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 0, 0]);
    }

    // change x1/x2, move right
    line.style.x1 += 100;
    line.style.x2 += 100;
    expect(line.getLocalPosition()).toStrictEqual([0, 0, 0]);
    expect(line.getTotalLength()).toStrictEqual(200);
    bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([400, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 0, 0]);
    }
    geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([400, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 0, 0]);
    }

    line.style.transform = 'translate(100, 0)';
    expect(line.getLocalPosition()).toStrictEqual([100, 0, 0]);
    bounds = line.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([500, 100, 0]);
      expect(bounds.halfExtents).toStrictEqual([100, 0, 0]);
    }
    geometryBounds = line.getGeometryBounds();
    if (geometryBounds) {
      expect(geometryBounds.center).toStrictEqual([400, 100, 0]);
      expect(geometryBounds.halfExtents).toStrictEqual([100, 0, 0]);
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

    expect(line.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // move right 100px
    line.translate(100, 0);
    expect(line.getLocalPosition()).toStrictEqual([100, 0, 0]);

    // change x1 now, should reset x/y
    line.style.x1 += 100;
    line.style.x2 += 100;
    expect(line.getLocalPosition()).toStrictEqual([100, 0, 0]);
  });

  it('should create a 3D line', () => {
    const line = new Line({
      style: {
        x1: 200,
        y1: 100,
        z1: 100,
        x2: 400,
        y2: 100,
        z2: 100,
        lineWidth: 10,
      },
    });

    expect(line.getLocalPosition()).toStrictEqual([0, 0, 0]);

    line.style.z1! -= 200;
    expect(line.getLocalPosition()).toStrictEqual([0, 0, 0]);
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
    expect(point.x).toBe(200);
    expect(point.y).toBe(100);
    point = line.getPoint(0, true);
    expect(point.x).toBe(200);
    expect(point.y).toBe(100);

    point = line.getPoint(0.5);
    expect(point.x).toBe(300);
    expect(point.y).toBe(100);

    point = line.getPoint(1);
    expect(point.x).toBe(400);
    expect(point.y).toBe(100);

    point = line.getPointAtLength(0);
    expect(point.x).toBe(200);
    expect(point.y).toBe(100);
    point = line.getPointAtLength(0, true);
    expect(point.x).toBe(200);
    expect(point.y).toBe(100);

    point = line.getPointAtLength(200);
    expect(point.x).toBe(400);
    expect(point.y).toBe(100);
  });

  it('should append marker correctly', () => {
    const circle = new Circle({
      style: {
        r: 50,
      },
    });
    const line = new Line({
      style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        lineWidth: 10,
        markerStart: circle,
        markerEnd: circle,
      },
    });
    expect(line.childNodes.length).toBe(2);

    line.style.markerStart = null;
    expect(line.childNodes.length).toBe(1);

    line.style.markerEnd = null;
    expect(line.childNodes.length).toBe(0);

    line.style.markerStart = circle;
    line.style.markerStartOffset = 10;
    expect(line.childNodes.length).toBe(1);

    line.style.markerEnd = circle;
    line.style.markerEndOffset = 10;
    expect(line.childNodes.length).toBe(2);
  });
});

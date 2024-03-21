import { Polyline } from '../../../packages/g/src';

describe('Polyline', () => {
  it('should calc global bounds correctly', () => {
    const points: [number, number][] = [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
      [250, 250],
      [300, 250],
      [300, 300],
      [350, 300],
      [350, 350],
      [400, 350],
      [400, 400],
      [450, 400],
    ];

    const polyline = new Polyline({
      style: {
        points,
        lineWidth: 10,
      },
    });

    // get local position, left top corner
    expect(polyline.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // get length
    expect(polyline.getTotalLength()).toBe(750);

    // get bounds
    let bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([250, 225, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 175, 0]);
    }

    // change lineWidth
    polyline.style.lineWidth = 20;
    bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([250, 225, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 175, 0]);
    }

    // change first point
    let newPoints = [...points];
    newPoints[0] = [0, 0];
    polyline.style.points = newPoints;
    expect(polyline.getLocalPosition()).toStrictEqual([0, 0, 0]);
    bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([225, 200, 0]);
      expect(bounds.halfExtents).toStrictEqual([225, 200, 0]);
    }

    polyline.translate(100, 0);

    // restore
    newPoints = [...points];

    // should override x/y when points changed
    newPoints[0] = [50, 50];
    polyline.style.points = newPoints;
    expect(polyline.getLocalPosition()).toStrictEqual([100, 0, 0]);
    bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([350, 225, 0]);
      expect(bounds.halfExtents).toStrictEqual([200, 175, 0]);
    }
    expect(polyline.getTotalLength()).toBe(750);
  });

  it('should remove points attribute correctly', () => {
    const polyline = new Polyline({
      style: {
        points: [
          [50, 50],
          [100, 50],
          [100, 100],
        ],
        lineWidth: 10,
      },
    });
    let bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([75, 75, 0]);
      expect(bounds.halfExtents).toStrictEqual([25, 25, 0]);
    }

    polyline.removeAttribute('points');
    bounds = polyline.getBounds();
    if (bounds) {
      expect(bounds.center).toStrictEqual([0, 0, 0]);
      expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);
    }
  });

  it('should getPoint at ratio correctly', () => {
    const polyline = new Polyline({
      style: {
        points: [
          [50, 50],
          [100, 50],
          [100, 100],
        ],
        lineWidth: 10,
      },
    });

    let point = polyline.getPoint(0);
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);
    point = polyline.getPoint(0, true);
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);

    point = polyline.getPoint(0.5);
    expect(point.x).toBe(100);
    expect(point.y).toBe(50);

    point = polyline.getPoint(1);
    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    // outside, return p[0]
    point = polyline.getPoint(10);
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);

    point = polyline.getPointAtLength(0);
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);
    point = polyline.getPointAtLength(0, true);
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);

    point = polyline.getPointAtLength(50);
    expect(point.x).toBe(100);
    expect(point.y).toBe(50);
  });

  it('should calc tangent correctly', () => {
    const polyline = new Polyline({
      style: {
        points: [
          [50, 50],
          [100, 50],
          [100, 100],
        ],
        lineWidth: 10,
      },
    });

    expect(polyline.getStartTangent()).toStrictEqual([
      [100, 50],
      [50, 50],
    ]);

    expect(polyline.getEndTangent()).toStrictEqual([
      [100, 50],
      [100, 100],
    ]);
  });
});

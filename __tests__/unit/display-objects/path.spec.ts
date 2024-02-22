import type { PathArray } from '@antv/util';
import { AABB, Circle, Path } from '../../../packages/g/src';

describe('Path', () => {
  it('should support empty path definition', () => {
    // use empty string
    const path = new Path({
      style: {
        d: '',
        lineWidth: 10,
      },
    });

    let bounds = path.getBounds();
    expect(AABB.isEmpty(bounds)).toBeTruthy();
    expect(bounds.center).toStrictEqual([0, 0, 0]);
    expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);

    // use empty path array
    // @ts-ignore
    path.style.path = [];
    bounds = path.getBounds();
    expect(AABB.isEmpty(bounds)).toBeTruthy();
    expect(bounds.center).toStrictEqual([0, 0, 0]);
    expect(bounds.halfExtents).toStrictEqual([0, 0, 0]);
  });

  it('should calc global bounds correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    // get local position, left top corner
    expect(path.getLocalPosition()).toStrictEqual([0, 0, 0]);

    // get length
    expect(path.getTotalLength()).toBe(100);

    path.style.setProperty('d', 'M 0 0 L 200 0');
    expect(path.getLocalPosition()).toStrictEqual([0, 0, 0]);
    expect(path.getTotalLength()).toBe(200);

    // // get bounds
    // let bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toStrictEqual([250, 225, 0));
    //   expect(bounds.halfExtents).toStrictEqual([210, 185, 0));
    // }

    // // change lineWidth
    // polyline.style.lineWidth = 20;
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toStrictEqual([250, 225, 0));
    //   expect(bounds.halfExtents).toStrictEqual([220, 195, 0));
    // }

    // // change first point
    // let newPoints = [...points];
    // newPoints[0] = [0, 0];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).toStrictEqual([0, 0, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toStrictEqual([225, 200, 0));
    //   expect(bounds.halfExtents).toStrictEqual([245, 220, 0));
    // }

    // polyline.translate(100, 0);

    // // restore
    // newPoints = [...points];
    // newPoints[0] = [50, 50];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).toStrictEqual([150, 50, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).toStrictEqual([350, 225, 0));
    //   expect(bounds.halfExtents).toStrictEqual([220, 195, 0));
    // }
    // expect(polyline.getTotalLength()).toBe(750);
  });

  it('should handle invalid path correctly', () => {
    const pathArray: PathArray = [
      // @ts-ignore
      ['XX', 0, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getTotalLength()).toBe(0);

    const point = path.getPoint(0)!;
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);
  });

  it('should use `d` property in path correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 10, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getTotalLength()).toBe(10);
  });

  it('should getPoint at ratio correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    let point = path.getPoint(0);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);
    point = path.getPoint(0, true);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);

    point = path.getPoint(0.5);
    expect(point.x).toBe(50);
    expect(point.y).toBe(0);

    point = path.getPoint(1);
    expect(point.x).toBe(100);
    expect(point.y).toBe(0);

    point = path.getPoint(10);
    expect(point.x).toBe(100);
    expect(point.y).toBe(0);

    point = path.getPointAtLength(0);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);

    point = path.getPointAtLength(50);
    expect(point.x).toBe(50);
    expect(point.y).toBe(0);
  });

  it('should getPoint on a quad bezier correctly', () => {
    const pathArray: PathArray = [
      ['M', 968, 400],
      ['Q', 913, 400, 858, 400],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });
    path.translate(-800, -150);

    let point = path.getPoint(0);
    expect(point.x).toBe(168);
    expect(point.y).toBe(250);
    point = path.getPoint(0, true);
    expect(point.x).toBe(168);
    expect(point.y).toBe(250);

    point = path.getPoint(0.5);
    expect(point.x).toBe(113);
    expect(point.y).toBe(250);

    point = path.getPoint(1);
    expect(point.x).toBe(58);
    expect(point.y).toBe(250);

    // point = path.getPoint(10);
    // expect(point.x).toBe(100);
    // expect(point.y).toBe(0);
  });

  it('should calc tangent correctly', () => {
    const pathArray: PathArray = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        d: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getStartTangent()).toStrictEqual([
      [100, 0],
      [0, 0],
    ]);

    expect(path.getEndTangent()).toStrictEqual([
      [0, 0],
      [100, 0],
    ]);
  });

  it('should append marker correctly', () => {
    const circle = new Circle({
      style: {
        r: 50,
      },
    });

    const polygon = new Path({
      style: {
        d: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
        markerStart: circle,
        markerEnd: circle,
        markerMid: circle,
      },
    });
    expect(polygon.childNodes.length).toBe(5);

    polygon.style.markerStart = null;
    expect(polygon.childNodes.length).toBe(4);

    polygon.style.markerEnd = null;
    expect(polygon.childNodes.length).toBe(3);

    polygon.style.markerMid = null;
    expect(polygon.childNodes.length).toBe(0);

    polygon.style.markerStart = circle;
    polygon.style.markerStartOffset = 10;
    expect(polygon.childNodes.length).toBe(1);

    polygon.style.markerEnd = circle;
    polygon.style.markerEndOffset = 10;
    expect(polygon.childNodes.length).toBe(2);

    polygon.style.markerMid = circle;
    expect(polygon.childNodes.length).toBe(5);
  });
});

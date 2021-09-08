import { expect } from 'chai';
import { Path } from '../..';
import { vec3 } from 'gl-matrix';
import { PathCommand } from '../../types';

describe('Path', () => {
  it('should calc global bounds correctly', () => {
    const pathArray: PathCommand[] = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    // get local position, left top corner
    expect(path.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));

    // get length
    expect(path.getTotalLength()).eqls(100);

    // // get bounds
    // let bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(250, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(210, 185, 0));
    // }

    // // change lineWidth
    // polyline.style.lineWidth = 20;
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(250, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(220, 195, 0));
    // }

    // // change first point
    // let newPoints = [...points];
    // newPoints[0] = [0, 0];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(225, 200, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(245, 220, 0));
    // }

    // polyline.translate(100, 0);

    // // restore
    // newPoints = [...points];
    // newPoints[0] = [50, 50];
    // polyline.style.points = newPoints;
    // expect(polyline.getLocalPosition()).eqls(vec3.fromValues(150, 50, 0));
    // bounds = polyline.getBounds();
    // if (bounds) {
    //   expect(bounds.center).eqls(vec3.fromValues(350, 225, 0));
    //   expect(bounds.halfExtents).eqls(vec3.fromValues(220, 195, 0));
    // }
    // expect(polyline.getTotalLength()).eqls(750);
  });

  it('should handle invalid path correctly', () => {
    const pathArray: PathCommand[] = [
      // @ts-ignore
      ['XX', 0, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getTotalLength()).eqls(0);

    let point = path.getPoint(0)!;
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);
  });

  it('should getPoint at ratio correctly', () => {
    const pathArray: PathCommand[] = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    let point = path.getPoint(0)!;
    expect(point.x).eqls(0);
    expect(point.y).eqls(0);

    // point = path.getPoint(0.5)!;
    // expect(point.x).eqls(50);
    // expect(point.y).eqls(0);

    // point = path.getPoint(1)!;
    // expect(point.x).eqls(100);
    // expect(point.y).eqls(0);

    // point = path.getPoint(10)!;
    // expect(point.x).eqls(0);
    // expect(point.y).eqls(0);
  });

  it('should calc tangent correctly', () => {
    const pathArray: PathCommand[] = [
      ['M', 0, 0],
      ['L', 100, 0],
    ];

    const path = new Path({
      style: {
        path: pathArray,
        lineWidth: 10,
      },
    });

    expect(path.getStartTangent()).eqls([
      [100, 0],
      [0, 0],
    ]);

    expect(path.getEndTangent()).eqls([
      [0, 0],
      [100, 0],
    ]);
  });
});

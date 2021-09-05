import { expect } from 'chai';
import { Polygon } from '../..';
import { vec3 } from 'gl-matrix';

describe('Polygon', () => {
  it('should calc global bounds correctly', () => {
    const points: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];

    const polygon = new Polygon({
      style: {
        points,
      },
    });

    // get local position, left top corner
    expect(polygon.getLocalPosition()).eqls(vec3.fromValues(0, 0, 0));

    // get bounds
    let bounds = polygon.getBounds();
    if (bounds) {
      expect(bounds.center).eqls(vec3.fromValues(50, 50, 0));
      expect(bounds.halfExtents).eqls(vec3.fromValues(50, 50, 0));
    }
  });
});

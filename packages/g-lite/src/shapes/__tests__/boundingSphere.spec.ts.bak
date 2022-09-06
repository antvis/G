import { BoundingSphere } from '@antv/g';
import { expect } from 'chai';
import { vec3 } from 'gl-matrix';

describe('Bounding Sphere', () => {
  test('should overlap with another bounding sphere.', () => {
    const sphere1 = new BoundingSphere();
    const sphere2 = new BoundingSphere();
    const sphere3 = new BoundingSphere(vec3.fromValues(10, 0, 0));

    expect(sphere1.intersects(sphere2)).to.true;
    expect(sphere1.intersects(sphere3)).to.false;
  });

  test('should contain a point.', () => {
    const sphere1 = new BoundingSphere();

    expect(sphere1.containsPoint(vec3.fromValues(0, 0, 0))).to.true;
    expect(sphere1.containsPoint(vec3.fromValues(10, 0, 0))).to.false;
  });
});

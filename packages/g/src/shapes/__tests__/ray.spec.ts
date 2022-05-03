import { expect } from 'chai';
import { vec3 } from 'gl-matrix';
import { BoundingSphere, Plane, Ray } from '@antv/g';

describe('Ray', () => {
  test('should intersect with plane.', () => {
    const plane = new Plane(0, vec3.fromValues(0, 1, 0));
    let ray = new Ray(vec3.fromValues(0, 10, 0), vec3.fromValues(0, -1, 0));

    const intersection = vec3.create();
    let intersects = ray.intersectsPlane(plane, intersection);
    expect(intersects).to.true;
    expect(intersection).to.eqls(vec3.fromValues(0, 0, 0));

    ray = new Ray(vec3.fromValues(10, 10, 0), vec3.fromValues(0, -1, 0));
    intersects = ray.intersectsPlane(plane, intersection);
    expect(intersects).to.true;
    expect(intersection).to.eqls(vec3.fromValues(10, 0, 0));
  });

  test('should not intersect with a parallel plane.', () => {
    const plane = new Plane(0, vec3.fromValues(0, 1, 0));
    const ray = new Ray(vec3.fromValues(0, 10, 0), vec3.fromValues(1, 0, 0));

    const intersection = vec3.create();
    const intersects = ray.intersectsPlane(plane, intersection);
    expect(intersects).to.false;
    expect(intersection).to.eqls(vec3.create());
  });

  test('should intersect with a bounding sphere.', () => {
    const ray = new Ray(vec3.fromValues(0, 10, 0), vec3.fromValues(0, -1, 0));
    const sphere1 = new BoundingSphere();
    const sphere2 = new BoundingSphere(vec3.fromValues(1, 0, 0));

    const intersection = vec3.create();
    let intersects = ray.intersectsSphere(sphere1, intersection);
    expect(intersects).to.true;
    expect(intersection).to.eqls(vec3.fromValues(0, 0.5, 0));

    intersects = ray.intersectsSphere(sphere2, intersection);
    expect(intersects).to.false;
  });
});

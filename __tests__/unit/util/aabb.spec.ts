import { expect } from 'chai';
import { AABB, Plane } from '../../../packages/g-lite/src';

describe('AABB', () => {
  test('should construct correctly.', () => {
    const aabb = new AABB([0, 0, 0], [0.5, 0.5, 0.5]);

    expect(aabb.getMin()).to.eqls([-0.5, -0.5, -0.5]);
    expect(aabb.getMax()).to.eqls([0.5, 0.5, 0.5]);

    aabb.setMinMax([1, 1, 1], [2, 2, 2]);
    expect(aabb.center).to.eqls([1.5, 1.5, 1.5]);
    expect(aabb.halfExtents).to.eqls([0.5, 0.5, 0.5]);
    expect(aabb.getMin()).to.eqls([1, 1, 1]);
    expect(aabb.getMax()).to.eqls([2, 2, 2]);
  });

  test('should merge 2 AABBs correctly.', () => {
    const aabb1 = new AABB([0, 0, 0], [0.5, 0.5, 0.5]);
    const aabb2 = new AABB([1, 1, 1], [0.5, 0.5, 0.5]);

    aabb1.add(aabb2);

    expect(aabb1.center).to.eqls([0.5, 0.5, 0.5]);
    expect(aabb1.halfExtents).to.eqls([1, 1, 1]);
    expect(aabb1.getMin()).to.eqls([-0.5, -0.5, -0.5]);
    expect(aabb1.getMax()).to.eqls([1.5, 1.5, 1.5]);
  });

  test('should intersects with another AABB.', () => {
    const aabb1 = new AABB([0, 0, 0], [0.5, 0.5, 0.5]);
    const aabb2 = new AABB([1, 1, 1], [0.5, 0.5, 0.5]);
    const aabb3 = new AABB([2, 2, 2], [0.5, 0.5, 0.5]);

    expect(aabb1.intersects(aabb2)).to.true;
    expect(aabb1.intersects(aabb3)).to.false;
  });

  // test('should contains a Point.', () => {
  //   const aabb1 = new AABB(
  //     [0, 0, 0],
  //     [0.5, 0.5, 0.5],
  //   );

  //   expect(aabb1.containsPoint([0.1, 0.1, 0.1])).to.true;
  //   expect(aabb1.containsPoint([0.6, 0.1, 0.1])).to.false;
  // });

  // test('should intersects with Ray.', () => {
  //   const aabb1 = new AABB([0, 0, 0), [0.5, 0.5, 0.5));

  //   const ray1 = new Ray([0, 10, 0), [0, -1, 0));
  //   const ray2 = new Ray([0, 10, 0), [0, 1, 0));

  //   let intersection = vec3.create();
  //   let intersects = ray1.intersectsAABB(aabb1, intersection);
  //   expect(intersects).to.true;
  //   expect(intersection).to.eqls([0, 0.5, 0));

  //   intersection = vec3.create();
  //   intersects = ray2.intersectsAABB(aabb1, intersection);
  //   expect(intersects).to.false;
  //   expect(intersection).to.eqls(vec3.create());
  // });

  test('should get p-vertex & n-vertex based on each plane of culling volume.', () => {
    const aabb = new AABB([0, 0, 0], [0.5, 0.5, 0.5]);
    let plane = new Plane(0, [1, 1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([-0.5, -0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([0.5, 0.5, 0.5]);

    plane = new Plane(0, [1, -1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([-0.5, 0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([0.5, -0.5, 0.5]);

    plane = new Plane(0, [1, 1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([-0.5, -0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([0.5, 0.5, -0.5]);

    plane = new Plane(0, [-1, 1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([0.5, -0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([-0.5, 0.5, 0.5]);

    plane = new Plane(0, [-1, -1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([0.5, 0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([-0.5, -0.5, 0.5]);

    plane = new Plane(0, [1, -1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([-0.5, 0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([0.5, -0.5, -0.5]);

    plane = new Plane(0, [-1, 1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([0.5, -0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([-0.5, 0.5, -0.5]);

    plane = new Plane(0, [-1, -1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).to.eqls([0.5, 0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).to.eqls([-0.5, -0.5, -0.5]);
  });
});

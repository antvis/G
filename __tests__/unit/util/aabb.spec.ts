import { AABB, Plane } from '../../../packages/g-lite/src';

describe('AABB', () => {
  test('should construct correctly.', () => {
    const aabb = new AABB();
    aabb.update([0, 0, 0], [0.5, 0.5, 0.5]);

    expect(aabb.getMin()).toStrictEqual([-0.5, -0.5, -0.5]);
    expect(aabb.getMax()).toStrictEqual([0.5, 0.5, 0.5]);

    aabb.setMinMax([1, 1, 1], [2, 2, 2]);
    expect(aabb.center).toStrictEqual([1.5, 1.5, 1.5]);
    expect(aabb.halfExtents).toStrictEqual([0.5, 0.5, 0.5]);
    expect(aabb.getMin()).toStrictEqual([1, 1, 1]);
    expect(aabb.getMax()).toStrictEqual([2, 2, 2]);
  });

  test('should merge 2 AABBs correctly.', () => {
    const aabb1 = new AABB();
    aabb1.update([0, 0, 0], [0.5, 0.5, 0.5]);
    const aabb2 = new AABB();
    aabb2.update([1, 1, 1], [0.5, 0.5, 0.5]);

    aabb1.add(aabb2);

    expect(aabb1.center).toStrictEqual([0.5, 0.5, 0.5]);
    expect(aabb1.halfExtents).toStrictEqual([1, 1, 1]);
    expect(aabb1.getMin()).toStrictEqual([-0.5, -0.5, -0.5]);
    expect(aabb1.getMax()).toStrictEqual([1.5, 1.5, 1.5]);
  });

  test('should intersects with another AABB.', () => {
    const aabb1 = new AABB();
    aabb1.update([0, 0, 0], [0.5, 0.5, 0.5]);
    const aabb2 = new AABB();
    aabb2.update([1, 1, 1], [0.5, 0.5, 0.5]);
    const aabb3 = new AABB();
    aabb3.update([2, 2, 2], [0.5, 0.5, 0.5]);

    expect(aabb1.intersects(aabb2)).toBeTruthy();
    expect(aabb1.intersects(aabb3)).toBeFalsy();
  });

  // test('should contains a Point.', () => {
  //   const aabb1 = new AABB(
  //     [0, 0, 0],
  //     [0.5, 0.5, 0.5],
  //   );

  //   expect(aabb1.containsPoint([0.1, 0.1, 0.1])).toBeTruthy();
  //   expect(aabb1.containsPoint([0.6, 0.1, 0.1])).to.false;
  // });

  // test('should intersects with Ray.', () => {
  //   const aabb1 = new AABB([0, 0, 0), [0.5, 0.5, 0.5));

  //   const ray1 = new Ray([0, 10, 0), [0, -1, 0));
  //   const ray2 = new Ray([0, 10, 0), [0, 1, 0));

  //   let intersection = vec3.create();
  //   let intersects = ray1.intersectsAABB(aabb1, intersection);
  //   expect(intersects).toBeTruthy();
  //   expect(intersection).toStrictEqual([0, 0.5, 0));

  //   intersection = vec3.create();
  //   intersects = ray2.intersectsAABB(aabb1, intersection);
  //   expect(intersects).to.false;
  //   expect(intersection).toBe(vec3.create());
  // });

  test('should get p-vertex & n-vertex based on each plane of culling volume.', () => {
    const aabb = new AABB();
    aabb.update([0, 0, 0], [0.5, 0.5, 0.5]);
    let plane = new Plane(0, [1, 1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([-0.5, -0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([0.5, 0.5, 0.5]);

    plane = new Plane(0, [1, -1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([-0.5, 0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([0.5, -0.5, 0.5]);

    plane = new Plane(0, [1, 1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([-0.5, -0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([0.5, 0.5, -0.5]);

    plane = new Plane(0, [-1, 1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([0.5, -0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([-0.5, 0.5, 0.5]);

    plane = new Plane(0, [-1, -1, 1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([0.5, 0.5, -0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([-0.5, -0.5, 0.5]);

    plane = new Plane(0, [1, -1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([-0.5, 0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([0.5, -0.5, -0.5]);

    plane = new Plane(0, [-1, 1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([0.5, -0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([-0.5, 0.5, -0.5]);

    plane = new Plane(0, [-1, -1, -1]);
    expect(aabb.getNegativeFarPoint(plane)).toStrictEqual([0.5, 0.5, 0.5]);
    expect(aabb.getPositiveFarPoint(plane)).toStrictEqual([-0.5, -0.5, -0.5]);
  });
});

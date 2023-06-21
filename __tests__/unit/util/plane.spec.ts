import { vec3 } from 'gl-matrix';
import { Plane } from '../../../packages/g-lite/src';

describe('Plane', () => {
  test('should generate correct p-vertex & n-vertex flag.', () => {
    let plane = new Plane(0, vec3.fromValues(1, 1, 1));
    expect(plane.pnVertexFlag).toBe(0x111);

    plane = new Plane(0, vec3.fromValues(1, -1, 1));
    expect(plane.pnVertexFlag).toBe(0x101);

    plane = new Plane(0, vec3.fromValues(1, 1, -1));
    expect(plane.pnVertexFlag).toBe(0x110);

    plane = new Plane(0, vec3.fromValues(-1, 1, 1));
    expect(plane.pnVertexFlag).toBe(0x011);

    plane = new Plane(0, vec3.fromValues(-1, -1, 1));
    expect(plane.pnVertexFlag).toBe(0x001);

    plane = new Plane(0, vec3.fromValues(1, -1, -1));
    expect(plane.pnVertexFlag).toBe(0x100);

    plane = new Plane(0, vec3.fromValues(-1, 1, -1));
    expect(plane.pnVertexFlag).toBe(0x010);

    plane = new Plane(0, vec3.fromValues(-1, -1, -1));
    expect(plane.pnVertexFlag).toBe(0x000);
  });

  test('should calc distance to point.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    expect(plane.distanceToPoint(vec3.fromValues(0, 10, 0))).toBe(8);
  });

  test('should intersect with a line.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    const intersection = vec3.create();
    const intersects = plane.intersectsLine(
      vec3.fromValues(1, 10, 0),
      vec3.fromValues(1, -10, 0),
      intersection,
    );

    expect(intersects).toBeTruthy();
    expect(intersection).toStrictEqual(vec3.fromValues(1, 2, 0));
  });

  test('should not intersect with a parallel line.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    const intersection = vec3.create();
    const intersects = plane.intersectsLine(
      vec3.fromValues(-1, 10, 0),
      vec3.fromValues(1, 10, 0),
      intersection,
    );

    expect(intersects).toBeFalsy();
    expect(intersection).toStrictEqual(vec3.create());
  });
});

import { expect } from 'chai';
import { vec3 } from 'gl-matrix';
import { Plane } from '@antv/g';

describe('Plane', () => {
  test('should generate correct p-vertex & n-vertex flag.', () => {
    let plane = new Plane(0, vec3.fromValues(1, 1, 1));
    expect(plane.pnVertexFlag).to.eqls(0x111);

    plane = new Plane(0, vec3.fromValues(1, -1, 1));
    expect(plane.pnVertexFlag).to.eqls(0x101);

    plane = new Plane(0, vec3.fromValues(1, 1, -1));
    expect(plane.pnVertexFlag).to.eqls(0x110);

    plane = new Plane(0, vec3.fromValues(-1, 1, 1));
    expect(plane.pnVertexFlag).to.eqls(0x011);

    plane = new Plane(0, vec3.fromValues(-1, -1, 1));
    expect(plane.pnVertexFlag).to.eqls(0x001);

    plane = new Plane(0, vec3.fromValues(1, -1, -1));
    expect(plane.pnVertexFlag).to.eqls(0x100);

    plane = new Plane(0, vec3.fromValues(-1, 1, -1));
    expect(plane.pnVertexFlag).to.eqls(0x010);

    plane = new Plane(0, vec3.fromValues(-1, -1, -1));
    expect(plane.pnVertexFlag).to.eqls(0x000);
  });

  test('should calc distance to point.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    expect(plane.distanceToPoint(vec3.fromValues(0, 10, 0))).to.eqls(8);
  });

  test('should intersect with a line.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    const intersection = vec3.create();
    const intersects = plane.intersectsLine(
      vec3.fromValues(1, 10, 0),
      vec3.fromValues(1, -10, 0),
      intersection,
    );

    expect(intersects).to.true;
    expect(intersection).to.eqls(vec3.fromValues(1, 2, 0));
  });

  test('should not intersect with a parallel line.', () => {
    const plane = new Plane(2, vec3.fromValues(0, 1, 0));

    const intersection = vec3.create();
    const intersects = plane.intersectsLine(
      vec3.fromValues(-1, 10, 0),
      vec3.fromValues(1, 10, 0),
      intersection,
    );

    expect(intersects).to.false;
    expect(intersection).to.eqls(vec3.create());
  });
});

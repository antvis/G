import { mat4, vec3 } from 'gl-matrix';
import { Frustum } from '../../../packages/g-lite/src';

describe('Frustum', () => {
  test('should extract 6 planes from VP matrix.', () => {
    const projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, -1, 1, -1, 1, -1, 1);

    const viewMatrix = mat4.create();
    mat4.invert(
      viewMatrix,
      mat4.lookAt(
        mat4.create(),
        vec3.fromValues(0, 0, 10),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0),
      ),
    );

    const frustum = new Frustum();
    frustum.extractFromVPMatrix(projectionMatrix);

    // right plane
    expect(frustum.planes[0].normal).toStrictEqual(vec3.fromValues(-1, 0, 0));
    expect(frustum.planes[0].distance).toBe(1);

    // left
    expect(frustum.planes[1].normal).toStrictEqual(vec3.fromValues(1, 0, 0));
    expect(frustum.planes[1].distance).toBe(1);

    // bottom
    expect(frustum.planes[2].normal).toStrictEqual(vec3.fromValues(0, 1, 0));
    expect(frustum.planes[2].distance).toBe(1);

    // top
    expect(frustum.planes[3].normal).toStrictEqual(vec3.fromValues(0, -1, 0));
    expect(frustum.planes[3].distance).toBe(1);

    // far
    expect(frustum.planes[4].normal).toStrictEqual(vec3.fromValues(0, 0, 1));
    expect(frustum.planes[4].distance).toBe(1);

    // near
    expect(frustum.planes[5].normal).toStrictEqual(vec3.fromValues(0, 0, -1));
    expect(frustum.planes[5].distance).toBe(1);
  });
});

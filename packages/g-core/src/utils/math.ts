import { mat3, quat, vec2, vec3 } from 'gl-matrix';

export function createVec3(position: vec3 | number, y: number = 0, z: number = 0) {
  if (typeof position === 'number') {
    position = vec3.fromValues(position, y, z);
  }
  return position;
}

export function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function rad2deg(rad: number) {
  return rad * (180 / Math.PI);
}

/**
 * decompose mat3
 * extract translation/scaling/rotation(in radians)
 *
 * gl-matrix didn't provide them for mat3, but we can
 * @see https://math.stackexchange.com/a/1463487
 * @see https://math.stackexchange.com/a/417813
 */
export function getScaling(out: vec2, mat: mat3): vec2 {
  let m11 = mat[0];
  let m12 = mat[1];
  let m21 = mat[3];
  let m22 = mat[4];

  out[0] = Math.hypot(m11, m12);
  out[1] = Math.hypot(m21, m22);
  return out;
}
export function getTranslation(out: vec2, mat: mat3): vec2 {
  out[0] = mat[6];
  out[1] = mat[7];
  return out;
}
export function getRotationInRadians(mat: mat3): number {
  return Math.atan2(mat[1], mat[4]);
}

/**
 * @see https://github.com/toji/gl-matrix/issues/329
 * @see https://doc.babylonjs.com/divingDeeper/mesh/transforms/center_origin/rotation_conventions
 */
export function getEuler(out: vec3, quat: quat): vec3 {
  let x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3],
    x2 = x * x,
    y2 = y * y,
    z2 = z * z,
    w2 = w * w;
  let unit = x2 + y2 + z2 + w2;
  let test = x * w - y * z;
  if (test > 0.499995 * unit) {
    //TODO: Use glmatrix.EPSILON
    // singularity at the north pole
    out[0] = Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else if (test < -0.499995 * unit) {
    //TODO: Use glmatrix.EPSILON
    // singularity at the south pole
    out[0] = -Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else {
    out[0] = Math.asin(2 * (x * z - w * y));
    out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
    out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
  }
  // TODO: Return them as degrees and not as radians
  return out;
}

export function fromRotationTranslationScale(
  rotation: number,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
): mat3 {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return mat3.fromValues(scaleX * cos, scaleY * sin, 0, -scaleX * sin, scaleY * cos, 0, x, y, 1);
}

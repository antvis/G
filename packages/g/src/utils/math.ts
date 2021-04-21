import { isNumber } from '@antv/util';
import { mat3, mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';

export function getAngle(angle: number | undefined) {
  if (angle === undefined) {
    return 0;
  } else if (angle > 360 || angle < -360) {
    return angle % 360;
  }
  return angle;
}

export function createVec3(x: number | vec3 | vec4, y?: number, z?: number) {
  if (isNumber(x)) {
    return vec3.fromValues(x, y as number, z as number);
  }

  if ((x as vec3).length === 3) {
    return vec3.clone(x as vec3);
  }

  return vec3.fromValues(x[0], x[1], x[2]);
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

function getEulerFromQuat(out: vec3, quat: quat) {
  let x = quat[0];
  let y = quat[1];
  let z = quat[2];
  let w = quat[3];
  let x2 = x * x;
  let y2 = y * y;
  let z2 = z * z;
  let w2 = w * w;
  let unit = x2 + y2 + z2 + w2;
  let test = x * w - y * z;
  if (test > 0.499995 * unit) {
    // TODO: Use glmatrix.EPSILON
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

function getEulerFromMat4(out: vec3, m: mat4) {
  let x;
  let y;
  let z;
  const halfPi = Math.PI * 0.5;

  const [sx, sy, sz] = mat4.getScaling(vec3.create(), m);

  y = Math.asin(-m[2] / sx);

  if (y < halfPi) {
    if (y > -halfPi) {
      x = Math.atan2(m[6] / sy, m[10] / sz);
      z = Math.atan2(m[1] / sx, m[0] / sx);
    } else {
      // Not a unique solution
      z = 0;
      x = -Math.atan2(m[4] / sy, m[5] / sy);
    }
  } else {
    // Not a unique solution
    z = 0;
    x = Math.atan2(m[4] / sy, m[5] / sy);
  }

  out[0] = x;
  out[1] = y;
  out[2] = z;

  return out;
}

/**
 * @see https://github.com/toji/gl-matrix/issues/329
 * @see https://doc.babylonjs.com/divingDeeper/mesh/transforms/center_origin/rotation_conventions
 */
export function getEuler(out: vec3, quat: quat | mat4): vec3 {
  if (quat.length === 16) {
    return getEulerFromMat4(out, quat as mat4);
  } else {
    return getEulerFromQuat(out, quat as quat);
  }
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

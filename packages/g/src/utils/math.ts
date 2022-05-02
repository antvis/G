import { isArray, isNumber } from '@antv/util';
import type { quat, vec2, vec4 } from 'gl-matrix';
import { mat3, mat4, vec3 } from 'gl-matrix';

export function getAngle(angle?: number) {
  if (angle === undefined) {
    return 0;
  } else if (angle > 360 || angle < -360) {
    return angle % 360;
  }
  return angle;
}

export function createVec3(x: number | vec2 | vec3 | vec4, y: number = 0, z: number = 0) {
  if (isNumber(x)) {
    return vec3.fromValues(x, y, z);
  }

  if (isArray(x) && x.length === 3) {
    return vec3.clone(x);
  }

  return vec3.fromValues(x[0], x[1] || y, x[2] || z);
}

export function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function rad2deg(rad: number) {
  return rad * (180 / Math.PI);
}

export function grad2deg(grads: number) {
  grads = grads % 400;
  if (grads < 0) {
    grads += 400;
  }
  return (grads / 400) * 360;
}

export function deg2turn(deg: number) {
  return deg / 360;
}

export function turn2deg(turn: number) {
  return 360 * turn;
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
  const m11 = mat[0];
  const m12 = mat[1];
  const m21 = mat[3];
  const m22 = mat[4];

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
  const x = quat[0];
  const y = quat[1];
  const z = quat[2];
  const w = quat[3];
  const x2 = x * x;
  const y2 = y * y;
  const z2 = z * z;
  const w2 = w * w;
  const unit = x2 + y2 + z2 + w2;
  const test = x * w - y * z;
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
  let x: number;
  let z: number;
  const halfPi = Math.PI * 0.5;

  const [sx, sy, sz] = mat4.getScaling(vec3.create(), m);

  const y = Math.asin(-m[2] / sx);

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
  scaleY: number,
): mat3 {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return mat3.fromValues(scaleX * cos, scaleY * sin, 0, -scaleX * sin, scaleY * cos, 0, x, y, 1);
}

export function makePerspective(
  out: mat4,
  left: number,
  right: number,
  top: number,
  bottom: number,
  near: number,
  far: number,
) {
  const x = (2 * near) / (right - left);
  const y = (2 * near) / (top - bottom);

  const a = (right + left) / (right - left);
  const b = (top + bottom) / (top - bottom);
  const c = -(far + near) / (far - near);
  const d = (-2 * far * near) / (far - near);

  out[0] = x;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = y;
  out[6] = 0;
  out[7] = 0;
  out[8] = a;
  out[9] = b;
  out[10] = c;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = d;
  out[15] = 0;
  return out;
}

export function decompose(mat: mat3) {
  let row0x = mat[0];
  let row0y = mat[3];
  let row1x = mat[1];
  let row1y = mat[4];
  // decompose 3x3 matrix
  // @see https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix
  let scalingX = Math.sqrt(row0x * row0x + row0y * row0y);
  let scalingY = Math.sqrt(row1x * row1x + row1y * row1y);

  // If determinant is negative, one axis was flipped.
  const determinant = row0x * row1y - row0y * row1x;
  if (determinant < 0) {
    // Flip axis with minimum unit vector dot product.
    if (row0x < row1y) {
      scalingX = -scalingX;
    } else {
      scalingY = -scalingY;
    }
  }

  // Renormalize matrix to remove scale.
  if (scalingX) {
    row0x *= 1 / scalingX;
    row0y *= 1 / scalingX;
  }
  if (scalingY) {
    row1x *= 1 / scalingY;
    row1y *= 1 / scalingY;
  }

  // Compute rotation and renormalize matrix.
  const angle = Math.atan2(row0y, row0x);

  return [mat[6], mat[7], scalingX, scalingY, angle];
}

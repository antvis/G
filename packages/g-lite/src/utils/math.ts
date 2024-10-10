import { isNumber } from '@antv/util';
import type { quat, vec2 } from 'gl-matrix';
import { mat3, mat4, vec3, vec4 } from 'gl-matrix';

export function getAngle(angle?: number) {
  if (angle === undefined) {
    return 0;
  }
  if (angle > 360 || angle < -360) {
    return angle % 360;
  }
  return angle;
}

const $vec3 = vec3.create();
export function createVec3(
  x: number | vec2 | vec3 | vec4,
  y = 0,
  z = 0,
  clone = true,
) {
  if (Array.isArray(x) && x.length === 3) {
    return clone ? vec3.clone(x) : vec3.copy($vec3, x);
  }

  if (isNumber(x)) {
    return clone ? vec3.fromValues(x, y, z) : vec3.set($vec3, x, y, z);
  }

  return clone
    ? vec3.fromValues(x[0], x[1] || y, x[2] || z)
    : vec3.set($vec3, x[0], x[1] || y, x[2] || z);
}

const DEG_RAD = Math.PI / 180;
export function deg2rad(deg: number) {
  return deg * DEG_RAD;
}

const RAD_DEG = 180 / Math.PI;
export function rad2deg(rad: number) {
  return rad * RAD_DEG;
}

const GRAD_DEG = 0.9; // 360 / 400;
export function grad2deg(grads: number) {
  grads %= 400;
  if (grads < 0) {
    grads += 400;
  }
  return grads * GRAD_DEG;
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

const HALF_PI = Math.PI / 2;
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
    out[0] = HALF_PI;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else if (test < -0.499995 * unit) {
    // TODO: Use glmatrix.EPSILON
    // singularity at the south pole
    out[0] = -HALF_PI;
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

  const [sx, sy, sz] = mat4.getScaling(vec3.create(), m);

  const y = Math.asin(-m[2] / sx);

  if (y < HALF_PI) {
    if (y > -HALF_PI) {
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
  }
  return getEulerFromQuat(out, quat as quat);
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
  return mat3.fromValues(
    scaleX * cos,
    scaleY * sin,
    0,
    -scaleX * sin,
    scaleY * cos,
    0,
    x,
    y,
    1,
  );
}

export function makePerspective(
  out: mat4,
  left: number,
  right: number,
  top: number,
  bottom: number,
  near: number,
  far: number,
  zero = false,
) {
  const twoNear = 2 * near;
  const rightMinusLeft = right - left;
  const topMinusBottom = top - bottom;
  const x = twoNear / rightMinusLeft;
  const y = twoNear / topMinusBottom;

  const a = (right + left) / rightMinusLeft;
  const b = (top + bottom) / topMinusBottom;

  let c: number;
  let d: number;

  const farMinusNear = far - near;
  const farMulNear = far * near;
  if (zero) {
    c = -far / farMinusNear;
    d = -farMulNear / farMinusNear;
  } else {
    c = -(far + near) / farMinusNear;
    d = (-2 * farMulNear) / farMinusNear;
  }

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
  let row0y = mat[1];
  let row1x = mat[3];
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
    const invScalingX = 1 / scalingX;
    row0x *= invScalingX;
    row0y *= invScalingX;
  }
  if (scalingY) {
    const invScalingY = 1 / scalingY;
    row1x *= invScalingY;
    row1y *= invScalingY;
  }

  // Compute rotation and renormalize matrix.
  const rotation = Math.atan2(row0y, row0x);

  const angle = rad2deg(rotation);

  return [mat[6], mat[7], scalingX, scalingY, angle];
}

const tmp = mat4.create();
const perspectiveMatrix = mat4.create();
const tmpVec4 = vec4.create();
const row = [vec3.create(), vec3.create(), vec3.create()];
const pdum3 = vec3.create();

/*
Input:  matrix      ; a 4x4 matrix
Output: translation ; a 3 component vector
        scale       ; a 3 component vector
        skew        ; skew factors XY,XZ,YZ represented as a 3 component vector
        perspective ; a 4 component vector
        quaternion  ; a 4 component vector
Returns false if the matrix cannot be decomposed, true if it can


References:
https://github.com/kamicane/matrix3d/blob/master/lib/Matrix3d.js
https://github.com/ChromiumWebApps/chromium/blob/master/ui/gfx/transform_util.cc
http://www.w3.org/TR/css3-transforms/#decomposing-a-3d-matrix
*/
export function decomposeMat4(
  matrix: mat4,
  translation: vec3,
  scale: vec3,
  skew: vec3,
  perspective: vec4,
  quaternion: vec4,
) {
  // normalize, if not possible then bail out early
  if (!normalize(tmp, matrix)) return false;

  // perspectiveMatrix is used to solve for perspective, but it also provides
  // an easy way to test for singularity of the upper 3x3 component.
  mat4.copy(perspectiveMatrix, tmp);

  perspectiveMatrix[3] = 0;
  perspectiveMatrix[7] = 0;
  perspectiveMatrix[11] = 0;
  perspectiveMatrix[15] = 1;

  // If the perspectiveMatrix is not invertible, we are also unable to
  // decompose, so we'll bail early. Constant taken from SkMatrix44::invert.
  if (Math.abs(mat4.determinant(perspectiveMatrix)) < 1e-8) return false;

  const a03 = tmp[3];
  const a13 = tmp[7];
  const a23 = tmp[11];
  const a30 = tmp[12];
  const a31 = tmp[13];
  const a32 = tmp[14];
  const a33 = tmp[15];

  // First, isolate perspective.
  if (a03 !== 0 || a13 !== 0 || a23 !== 0) {
    tmpVec4[0] = a03;
    tmpVec4[1] = a13;
    tmpVec4[2] = a23;
    tmpVec4[3] = a33;

    // Solve the equation by inverting perspectiveMatrix and multiplying
    // rightHandSide by the inverse.
    // resuing the perspectiveMatrix here since it's no longer needed
    const ret = mat4.invert(perspectiveMatrix, perspectiveMatrix);
    if (!ret) return false;
    mat4.transpose(perspectiveMatrix, perspectiveMatrix);

    // multiply by transposed inverse perspective matrix, into perspective vec4
    vec4.transformMat4(perspective, tmpVec4, perspectiveMatrix);
  } else {
    // no perspective
    perspective[0] = perspective[1] = perspective[2] = 0;
    perspective[3] = 1;
  }

  // Next take care of translation
  translation[0] = a30;
  translation[1] = a31;
  translation[2] = a32;

  // Now get scale and shear. 'row' is a 3 element array of 3 component vectors
  mat3from4(row as unknown as mat3, tmp);

  // Compute X scale factor and normalize first row.
  scale[0] = vec3.length(row[0]);
  vec3.normalize(row[0], row[0]);

  // Compute XY shear factor and make 2nd row orthogonal to 1st.
  skew[0] = vec3.dot(row[0], row[1]);
  combine(row[1], row[1], row[0], 1.0, -skew[0]);

  // Now, compute Y scale and normalize 2nd row.
  scale[1] = vec3.length(row[1]);
  vec3.normalize(row[1], row[1]);
  skew[0] /= scale[1];

  // Compute XZ and YZ shears, orthogonalize 3rd row
  skew[1] = vec3.dot(row[0], row[2]);
  combine(row[2], row[2], row[0], 1.0, -skew[1]);
  skew[2] = vec3.dot(row[1], row[2]);
  combine(row[2], row[2], row[1], 1.0, -skew[2]);

  // Next, get Z scale and normalize 3rd row.
  scale[2] = vec3.length(row[2]);
  vec3.normalize(row[2], row[2]);
  skew[1] /= scale[2];
  skew[2] /= scale[2];

  // At this point, the matrix (in rows) is orthonormal.
  // Check for a coordinate system flip.  If the determinant
  // is -1, then negate the matrix and the scaling factors.
  vec3.cross(pdum3, row[1], row[2]);
  if (vec3.dot(row[0], pdum3) < 0) {
    for (let i = 0; i < 3; i++) {
      scale[i] *= -1;
      row[i][0] *= -1;
      row[i][1] *= -1;
      row[i][2] *= -1;
    }
  }

  // Now, get the rotations out
  quaternion[0] =
    0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0));
  quaternion[1] =
    0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0));
  quaternion[2] =
    0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0));
  quaternion[3] =
    0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0));

  if (row[2][1] > row[1][2]) quaternion[0] = -quaternion[0];
  if (row[0][2] > row[2][0]) quaternion[1] = -quaternion[1];
  if (row[1][0] > row[0][1]) quaternion[2] = -quaternion[2];
  return true;
}

function normalize(out: mat4, mat: mat4) {
  const m44 = mat[15];
  // Cannot normalize.
  if (m44 === 0) return false;
  const scale = 1 / m44;
  for (let i = 0; i < 16; i++) out[i] = mat[i] * scale;
  return true;
}

// gets upper-left of a 4x4 matrix into a 3x3 of vectors
function mat3from4(out: mat3, mat4x4: mat4) {
  out[0][0] = mat4x4[0];
  out[0][1] = mat4x4[1];
  out[0][2] = mat4x4[2];

  out[1][0] = mat4x4[4];
  out[1][1] = mat4x4[5];
  out[1][2] = mat4x4[6];

  out[2][0] = mat4x4[8];
  out[2][1] = mat4x4[9];
  out[2][2] = mat4x4[10];
}

function combine(out: vec3, a: vec3, b: vec3, scale1: number, scale2: number) {
  out[0] = a[0] * scale1 + b[0] * scale2;
  out[1] = a[1] * scale1 + b[1] * scale2;
  out[2] = a[2] * scale1 + b[2] * scale2;
}

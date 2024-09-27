import { mat4 } from 'gl-matrix';
import { Odeg, Opx } from '../css/cssom';
import { ParsedTransform, convertAngleUnit } from '../css/parser';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { deg2rad } from './math';

function createSkewMatrix(skewMatrix: mat4, skewX: number, skewY: number) {
  // Create an identity matrix
  mat4.identity(skewMatrix);
  // Apply skew to the matrix
  skewMatrix[4] = Math.tan(skewX); // Skew Y axis in X direction
  skewMatrix[1] = Math.tan(skewY); // Skew X axis in Y direction

  return skewMatrix;
}

const SCALE_EPSILON = 0.00001;
const tmpMat1 = mat4.create();
const tmpMat2 = mat4.create();
export function parsedTransformToMat4(
  transform: ParsedTransform[],
  object: DisplayObject,
): mat4 {
  if (transform.length) {
    const m = mat4.identity(tmpMat1);
    transform.forEach((parsed) => {
      const { t, d } = parsed;
      if (t === 'scale') {
        // scale(1) scale(1, 1)
        const newScale = d?.map((s) => Math.max(s.value, SCALE_EPSILON)) || [
          1, 1,
        ];
        mat4.fromScaling(tmpMat2, [newScale[0], newScale[1], 1]);
      } else if (t === 'scaleX') {
        const newScale = d?.map((s) => Math.max(s.value, SCALE_EPSILON)) || [1];
        mat4.fromScaling(tmpMat2, [newScale[0], 1, 1]);
      } else if (t === 'scaleY') {
        const newScale = d?.map((s) => Math.max(s.value, SCALE_EPSILON)) || [1];
        mat4.fromScaling(tmpMat2, [1, newScale[0], 1]);
      } else if (t === 'scaleZ') {
        const newScale = d?.map((s) => Math.max(s.value, SCALE_EPSILON)) || [1];
        mat4.fromScaling(tmpMat2, [1, 1, newScale[0]]);
      } else if (t === 'scale3d') {
        const newScale = d?.map((s) => Math.max(s.value, SCALE_EPSILON)) || [
          1, 1, 1,
        ];
        mat4.fromScaling(tmpMat2, [newScale[0], newScale[1], newScale[2]]);
      } else if (t === 'translate') {
        const newTranslation = d || [Opx, Opx];
        mat4.fromTranslation(tmpMat2, [
          newTranslation[0].value,
          newTranslation[1].value,
          0,
        ]);
      } else if (t === 'translateX') {
        const newTranslation = d || [Opx];
        mat4.fromTranslation(tmpMat2, [newTranslation[0].value, 0, 0]);
      } else if (t === 'translateY') {
        const newTranslation = d || [Opx];
        mat4.fromTranslation(tmpMat2, [0, newTranslation[0].value, 0]);
      } else if (t === 'translateZ') {
        const newTranslation = d || [Opx];
        mat4.fromTranslation(tmpMat2, [0, 0, newTranslation[0].value]);
      } else if (t === 'translate3d') {
        const newTranslation = d || [Opx, Opx, Opx];
        mat4.fromTranslation(tmpMat2, [
          newTranslation[0].value,
          newTranslation[1].value,
          newTranslation[2].value,
        ]);
      } else if (t === 'rotate') {
        const newAngles = d || [Odeg];
        mat4.fromZRotation(tmpMat2, deg2rad(convertAngleUnit(newAngles[0])));
      } else if (t === 'rotateX') {
        const newAngles = d || [Odeg];
        mat4.fromXRotation(tmpMat2, deg2rad(convertAngleUnit(newAngles[0])));
      } else if (t === 'rotateY') {
        const newAngles = d || [Odeg];
        mat4.fromYRotation(tmpMat2, deg2rad(convertAngleUnit(newAngles[0])));
      } else if (t === 'rotateZ') {
        const newAngles = d || [Odeg];
        mat4.fromZRotation(tmpMat2, deg2rad(convertAngleUnit(newAngles[0])));
      } else if (t === 'rotate3d') {
        const newAngles = d || [Opx, Opx, Opx, Odeg];
        mat4.fromRotation(tmpMat2, deg2rad(convertAngleUnit(newAngles[3])), [
          newAngles[0].value,
          newAngles[1].value,
          newAngles[2].value,
        ]);
      } else if (t === 'skew') {
        const newSkew = d?.map((s) => s.value) || [0, 0];
        createSkewMatrix(tmpMat2, deg2rad(newSkew[0]), deg2rad(newSkew[1]));
      } else if (t === 'skewX') {
        const newSkew = d?.map((s) => s.value) || [0];
        createSkewMatrix(tmpMat2, deg2rad(newSkew[0]), 0);
      } else if (t === 'skewY') {
        const newSkew = d?.map((s) => s.value) || [0];
        createSkewMatrix(tmpMat2, 0, deg2rad(newSkew[0]));
      } else if (t === 'matrix') {
        const [a, b, c, dd, tx, ty] = d.map((s) => s.value);
        mat4.set(tmpMat2, a, b, 0, 0, c, dd, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1);
      } else if (t === 'matrix3d') {
        // @ts-ignore
        mat4.set(tmpMat2, ...d.map((s) => s.value));
      }

      mat4.mul(m, m, tmpMat2);
    });
    object.setLocalTransform(m);
  } else {
    object.resetLocalTransform();
  }

  return object.getLocalTransform();
}

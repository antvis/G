import { mat4, vec3 } from 'gl-matrix';
import type { CSSUnitValue } from '../css/cssom';
import { ParsedTransform, convertAngleUnit } from '../css/parser';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { runtime } from '../global-runtime';
import type { TransformType } from '../types';
import { deg2rad } from './math';

function createSkewMatrix(skewMatrix: mat4, skewX: number, skewY: number) {
  // Create an identity matrix
  mat4.identity(skewMatrix);
  // Apply skew to the matrix
  skewMatrix[4] = Math.tan(skewX); // Skew Y axis in X direction
  skewMatrix[1] = Math.tan(skewY); // Skew X axis in Y direction

  return skewMatrix;
}

const $mat4_1 = mat4.create();
const $mat4_2 = mat4.create();

const parser: Record<TransformType, (d: CSSUnitValue[]) => void> = {
  scale: (d: CSSUnitValue[]) => {
    mat4.fromScaling($mat4_1, [d[0].value, d[1].value, 1]);
  },
  scaleX: (d: CSSUnitValue[]) => {
    mat4.fromScaling($mat4_1, [d[0].value, 1, 1]);
  },
  scaleY: (d: CSSUnitValue[]) => {
    mat4.fromScaling($mat4_1, [1, d[0].value, 1]);
  },
  scaleZ: (d: CSSUnitValue[]) => {
    mat4.fromScaling($mat4_1, [1, 1, d[0].value]);
  },
  scale3d: (d: CSSUnitValue[]) => {
    mat4.fromScaling($mat4_1, [d[0].value, d[1].value, d[2].value]);
  },
  translate: (d: CSSUnitValue[]) => {
    mat4.fromTranslation($mat4_1, [d[0].value, d[1].value, 0]);
  },
  translateX: (d: CSSUnitValue[]) => {
    mat4.fromTranslation($mat4_1, [d[0].value, 0, 0]);
  },
  translateY: (d: CSSUnitValue[]) => {
    mat4.fromTranslation($mat4_1, [0, d[0].value, 0]);
  },
  translateZ: (d: CSSUnitValue[]) => {
    mat4.fromTranslation($mat4_1, [0, 0, d[0].value]);
  },
  translate3d: (d: CSSUnitValue[]) => {
    mat4.fromTranslation($mat4_1, [d[0].value, d[1].value, d[2].value]);
  },
  rotate: (d: CSSUnitValue[]) => {
    mat4.fromZRotation($mat4_1, deg2rad(convertAngleUnit(d[0])));
  },
  rotateX: (d: CSSUnitValue[]) => {
    mat4.fromXRotation($mat4_1, deg2rad(convertAngleUnit(d[0])));
  },
  rotateY: (d: CSSUnitValue[]) => {
    mat4.fromYRotation($mat4_1, deg2rad(convertAngleUnit(d[0])));
  },
  rotateZ: (d: CSSUnitValue[]) => {
    mat4.fromZRotation($mat4_1, deg2rad(convertAngleUnit(d[0])));
  },
  rotate3d: (d: CSSUnitValue[]) => {
    mat4.fromRotation($mat4_1, deg2rad(convertAngleUnit(d[3])), [
      d[0].value,
      d[1].value,
      d[2].value,
    ]);
  },
  skew: (d: CSSUnitValue[]) => {
    createSkewMatrix($mat4_1, deg2rad(d[0].value), deg2rad(d[1].value));
  },
  skewX: (d: CSSUnitValue[]) => {
    createSkewMatrix($mat4_1, deg2rad(d[0].value), 0);
  },
  skewY: (d: CSSUnitValue[]) => {
    createSkewMatrix($mat4_1, 0, deg2rad(d[0].value));
  },
  matrix: (d: CSSUnitValue[]) => {
    // prettier-ignore
    mat4.set(
      $mat4_1,
      d[0].value, d[1].value, 0, 0,
      d[2].value, d[3].value, 0, 0,
      0,                   0, 1, 0,
      d[4].value, d[5].value, 0, 1,
    );
  },
  matrix3d: (d: CSSUnitValue[]) => {
    // @ts-ignore
    mat4.set($mat4_1, ...d.map((s) => s.value));
  },
};

const $vec3One = vec3.fromValues(1, 1, 1);
const $vec3Zero = vec3.create();
const optimizer: {
  [key in TransformType]?: (object: DisplayObject, d: CSSUnitValue[]) => void;
} = {
  translate: (object: DisplayObject, d: CSSUnitValue[]) => {
    runtime.sceneGraphService.setLocalScale(object, $vec3One, false);
    runtime.sceneGraphService.setLocalEulerAngles(
      object,
      $vec3Zero,
      undefined,
      undefined,
      false,
    );
    runtime.sceneGraphService.setLocalPosition(
      object,
      [d[0].value, d[1].value, 0],
      false,
    );
    runtime.sceneGraphService.dirtifyLocal(object, object.transformable);
  },
};

export function parsedTransformToMat4(
  transform: ParsedTransform[],
  object: DisplayObject,
): mat4 {
  if (transform.length) {
    if (transform.length === 1 && optimizer[transform[0].t]) {
      optimizer[transform[0].t](object, transform[0].d);
      return;
    }
    const m = mat4.identity($mat4_2);
    for (let i = 0; i < transform.length; i++) {
      const { t, d } = transform[i];
      const p = parser[t];
      if (p) {
        p(d);
        mat4.mul(m, m, $mat4_1);
      }
    }

    object.setLocalTransform(m);
  } else {
    object.resetLocalTransform();
  }

  return object.getLocalTransform();
}

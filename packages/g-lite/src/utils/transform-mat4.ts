import { mat4 } from 'gl-matrix';
import { Odeg, Opx } from '../css/cssom';
import { ParsedTransform, convertAngleUnit } from '../css/parser';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { deg2rad } from './math';

const tmpMat4 = mat4.create();
export function parsedTransformToMat4(
  transform: ParsedTransform[],
  object: DisplayObject,
): mat4 {
  const defX = object.parsedStyle.defX || 0;
  const defY = object.parsedStyle.defY || 0;
  // reset transform
  object.resetLocalTransform();
  object.setLocalPosition(defX, defY);

  transform.forEach((parsed) => {
    const { t, d } = parsed;
    if (t === 'scale') {
      // scale(1) scale(1, 1)
      const newScale = d?.map((s) => s.value) || [1, 1];
      object.scaleLocal(newScale[0], newScale[1], 1);
    } else if (t === 'scalex') {
      const newScale = d?.map((s) => s.value) || [1];
      object.scaleLocal(newScale[0], 1, 1);
    } else if (t === 'scaley') {
      const newScale = d?.map((s) => s.value) || [1];
      object.scaleLocal(1, newScale[0], 1);
    } else if (t === 'scalez') {
      const newScale = d?.map((s) => s.value) || [1];
      object.scaleLocal(1, 1, newScale[0]);
    } else if (t === 'scale3d') {
      const newScale = d?.map((s) => s.value) || [1, 1, 1];
      object.scaleLocal(newScale[0], newScale[1], newScale[2]);
    } else if (t === 'translate') {
      const newTranslation = d || [Opx, Opx];
      object.translateLocal(
        newTranslation[0].value,
        newTranslation[1].value,
        0,
      );
    } else if (t === 'translatex') {
      const newTranslation = d || [Opx];
      object.translateLocal(newTranslation[0].value, 0, 0);
    } else if (t === 'translatey') {
      const newTranslation = d || [Opx];
      object.translateLocal(0, newTranslation[0].value, 0);
    } else if (t === 'translatez') {
      const newTranslation = d || [Opx];
      object.translateLocal(0, 0, newTranslation[0].value);
    } else if (t === 'translate3d') {
      const newTranslation = d || [Opx, Opx, Opx];
      object.translateLocal(
        newTranslation[0].value,
        newTranslation[1].value,
        newTranslation[2].value,
      );
    } else if (t === 'rotate') {
      const newAngles = d || [Odeg];
      object.rotateLocal(0, 0, convertAngleUnit(newAngles[0]));
    } else if (t === 'rotatex') {
      const newAngles = d || [Odeg];
      object.rotateLocal(convertAngleUnit(newAngles[0]), 0, 0);
    } else if (t === 'rotatey') {
      const newAngles = d || [Odeg];
      object.rotateLocal(0, convertAngleUnit(newAngles[0]), 0);
    } else if (t === 'rotatez') {
      const newAngles = d || [Odeg];
      object.rotateLocal(0, 0, convertAngleUnit(newAngles[0]));
    } else if (t === 'rotate3d') {
      // 暂不支持绕指定轴旋转
      // const newAngles = value && value.d || [Odeg, Odeg, Odeg];
      // const oldAngles = old && old.d || [Odeg, Odeg, Odeg];
      // object.rotateLocal(
      //   newAngles[0].value - oldAngles[0].value,
      //   newAngles[1].value - oldAngles[1].value,
      //   newAngles[2].value - oldAngles[2].value,
      // );
    } else if (t === 'skew') {
      const newSkew = d?.map((s) => s.value) || [0, 0];
      object.setLocalSkew(deg2rad(newSkew[0]), deg2rad(newSkew[1]));
    } else if (t === 'skewx') {
      const newSkew = d?.map((s) => s.value) || [0];
      object.setLocalSkew(deg2rad(newSkew[0]), object.getLocalSkew()[1]);
    } else if (t === 'skewy') {
      const newSkew = d?.map((s) => s.value) || [0];
      object.setLocalSkew(object.getLocalSkew()[0], deg2rad(newSkew[0]));
    } else if (t === 'matrix') {
      const [a, b, c, dd, tx, ty] = d.map((s) => s.value);
      object.setLocalTransform(
        mat4.set(
          tmpMat4,
          a,
          b,
          0,
          0,
          c,
          dd,
          0,
          0,
          0,
          0,
          1,
          0,
          tx + defX,
          ty + defY,
          0,
          1,
        ),
      );
    } else if (t === 'matrix3d') {
      // @ts-ignore
      mat4.set(tmpMat4, ...d.map((s) => s.value));

      tmpMat4[12] += defX;
      tmpMat4[13] += defY;
      object.setLocalTransform(tmpMat4);
    }
  });

  return object.getLocalTransform();
}

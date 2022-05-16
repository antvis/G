import { singleton } from 'mana-syringe';
import { Opx, Odeg } from '../cssom';
import type { DisplayObject } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';
import { parseTransform, mergeTransforms } from '../parser';
import { ParsedBaseStyleProps } from '../..';

/**
 * @see /zh/docs/api/animation#支持变换的属性
 *
 * support the following formats like CSS Transform:
 *
 * scale
 * * scale(x, y)
 * * scaleX(x)
 * * scaleY(x)
 * * scaleZ(z)
 * * scale3d(x, y, z)
 *
 * translate (unit: none, px, %(relative to its bounds))
 * * translate(x, y) eg. translate(0, 0) translate(0, 30px) translate(100%, 100%)
 * * translateX(0)
 * * translateY(0)
 * * translateZ(0)
 * * translate3d(0, 0, 0)
 *
 * rotate (unit: deg rad turn)
 * * rotate(0.5turn) rotate(30deg) rotate(1rad)
 *
 * none
 *
 * unsupported for now:
 * * calc() eg. translate(calc(100% + 10px))
 * * matrix/matrix3d()
 * * skew/skewX/skewY
 * * perspective
 */
@singleton()
export class CSSPropertyTransform implements Partial<CSSProperty<any[], any[]>> {
  parser = parseTransform;

  mixer = mergeTransforms;

  postProcessor(object: DisplayObject) {
    const { transform, defX, defY } = object.parsedStyle as ParsedBaseStyleProps;

    if (transform && transform.length) {
      // reset transform
      object.resetLocalTransform();
      object.setLocalPosition(defX, defY);

      transform.forEach(({ t, d }) => {
        if (t === 'scale') {
          // scale(1) scale(1, 1)
          const newScale = d.map((s) => s.value) || [1, 1];
          object.scaleLocal(newScale[0], newScale[1], 1);
        } else if (t === 'scalex') {
          const newScale = d.map((s) => s.value) || [1];
          object.scaleLocal(newScale[0], 1, 1);
        } else if (t === 'scaley') {
          const newScale = d.map((s) => s.value) || [1];
          object.scaleLocal(1, newScale[0], 1);
        } else if (t === 'scalez') {
          const newScale = d.map((s) => s.value) || [1];
          object.scaleLocal(1, 1, newScale[0]);
        } else if (t === 'scale3d') {
          const newScale = d.map((s) => s.value) || [1, 1, 1];
          object.scaleLocal(newScale[0], newScale[1], newScale[2]);
        } else if (t === 'translate') {
          const newTranslation = d || [Opx, Opx];
          object.translateLocal(newTranslation[0].value, newTranslation[1].value, 0);
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
          object.rotateLocal(0, 0, newAngles[0].value);
        } else if (t === 'rotatex') {
          const newAngles = d || [Odeg];
          object.rotateLocal(newAngles[0].value, 0, 0);
        } else if (t === 'rotatey') {
          const newAngles = d || [Odeg];
          object.rotateLocal(0, newAngles[0].value, 0);
        } else if (t === 'rotatez') {
          const newAngles = d || [Odeg];
          object.rotateLocal(0, 0, newAngles[0].value);
        } else if (t === 'rotate3d') {
          // 暂不支持绕指定轴旋转
          // const newAngles = value && value.d || [Odeg, Odeg, Odeg];
          // const oldAngles = old && old.d || [Odeg, Odeg, Odeg];
          // object.rotateLocal(
          //   newAngles[0].value - oldAngles[0].value,
          //   newAngles[1].value - oldAngles[1].value,
          //   newAngles[2].value - oldAngles[2].value,
          // );
        }
      });
    }
  }
}

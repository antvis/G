import { singleton } from 'mana-syringe';
import type {
  CSSProperty,
  DisplayObject} from '../..';
import {
  AABB,
  UnitType,
  CSSUnitValue,
  parseTransformOrigin,
  Shape,
} from '../..';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin
 * @example
 * [10px, 10px] [10%, 10%]
 */
@singleton()
export class CSSPropertyTransformOrigin
  implements Partial<CSSProperty<[CSSUnitValue, CSSUnitValue], [CSSUnitValue, CSSUnitValue]>>
{
  parser = parseTransformOrigin;

  postProcessor(object: DisplayObject) {
    const newValue = object.parsedStyle.transformOrigin;

    let usedOriginXValue = convertPercentUnit(newValue[0], 0, object);
    let usedOriginYValue = convertPercentUnit(newValue[1], 1, object);

    if (object.nodeName === Shape.CIRCLE) {
      usedOriginXValue -= object.parsedStyle.r.value;
      usedOriginYValue -= object.parsedStyle.r.value;
    } else if (object.nodeName === Shape.ELLIPSE) {
      usedOriginXValue -= object.parsedStyle.rx.value;
      usedOriginYValue -= object.parsedStyle.ry.value;
    } else if (object.nodeName === Shape.TEXT) {
    }

    object.setOrigin([usedOriginXValue, usedOriginYValue]);

    // return newValue;
    return [new CSSUnitValue(usedOriginXValue, 'px'), new CSSUnitValue(usedOriginYValue, 'px')];
  }
}

export function convertPercentUnit(
  valueWithUnit: CSSUnitValue,
  vec3Index: number,
  target: DisplayObject,
): number {
  // use bounds
  const bounds = target.getGeometryBounds();
  let size = 0;
  if (!AABB.isEmpty(bounds)) {
    size = bounds.halfExtents[vec3Index] * 2;
  }

  if (valueWithUnit.unit === UnitType.kPixels) {
    return Number(valueWithUnit.value);
  } else if (valueWithUnit.unit === UnitType.kPercentage && target) {
    return (Number(valueWithUnit.value) / 100) * size;
  }
  return 0;
}

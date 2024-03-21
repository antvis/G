import { DisplayObject } from '../../display-objects';
import { ParsedBaseStyleProps } from '../../types';
import { UnitType, type CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import {
  parseTransformOrigin,
  parseTransformOriginUnmemoize,
} from '../parser/transform-origin';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin
 * @example
 * [10px, 10px] [10%, 10%]
 */
export class CSSPropertyTransformOrigin
  implements
    Partial<
      CSSProperty<[CSSUnitValue, CSSUnitValue], [CSSUnitValue, CSSUnitValue]>
    >
{
  parser = parseTransformOrigin;
  parserUnmemoize = parseTransformOriginUnmemoize;

  postProcessor(object: DisplayObject) {
    const { transformOrigin } = object.parsedStyle as ParsedBaseStyleProps;
    if (
      transformOrigin[0].unit === UnitType.kPixels &&
      transformOrigin[1].unit === UnitType.kPixels
    ) {
      object.setOrigin(transformOrigin[0].value, transformOrigin[1].value);
    } else {
      // Relative to geometry bounds, calculate later.
      object.getGeometryBounds();
    }
  }
}

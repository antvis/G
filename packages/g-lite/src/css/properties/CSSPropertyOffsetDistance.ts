import { Shape } from '../..';
import { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import {
  clampedMergeNumbers,
  parseNumber,
  parseNumberUnmemoize,
} from '../parser/numeric';
export class CSSPropertyOffsetDistance
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  parser = parseNumber;
  parserUnmemoize = parseNumberUnmemoize;
  parserWithCSSDisabled = null;

  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
  ): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);

  postProcessor(object: DisplayObject) {
    const { offsetPath, offsetDistance } = object.parsedStyle;
    if (!offsetPath) {
      return;
    }

    const { nodeName } = offsetPath;
    if (
      nodeName === Shape.LINE ||
      nodeName === Shape.PATH ||
      nodeName === Shape.POLYLINE
    ) {
      // set position in world space
      const point = offsetPath.getPoint(offsetDistance);
      if (point) {
        object.setLocalPosition(point.x, point.y);
      }
    }
  }
}

import type { DisplayObject } from '../../display-objects';
import { Shape } from '../../types';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { clampedMergeNumbers, parseNumber } from '../parser/numeric';
export class CSSPropertyOffsetDistance
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  parser = parseNumber;
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
        object.parsedStyle.defX = point.x;
        object.parsedStyle.defY = point.y;
        object.setLocalPosition(point.x, point.y);
      }
    }
  }
}

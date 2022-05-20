import { Shape } from '../../types';
import type { DisplayObject } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { parseNumber, clampedMergeNumbers } from '../parser';

export const CSSPropertyOffsetDistance: Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> = {
  parser: parseNumber,

  mixer: clampedMergeNumbers(0, 1),

  postProcessor(object: DisplayObject) {
    if (!object.attributes.offsetPath) {
      return;
    }

    const offsetPathNodeName = object.attributes.offsetPath.nodeName;
    if (
      offsetPathNodeName === Shape.LINE ||
      offsetPathNodeName === Shape.PATH ||
      offsetPathNodeName === Shape.POLYLINE
    ) {
      const point = object.attributes.offsetPath.getPoint(object.parsedStyle.offsetDistance.value);
      if (point) {
        object.setLocalPosition(point.x, point.y);
      }
    }
  },
};

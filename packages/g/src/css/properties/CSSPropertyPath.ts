import { Shape } from '../../types';
import type { DisplayObject, ParsedPathStyleProps } from '../../display-objects';
import { Rectangle } from '../../shapes';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { parsePath, mergePaths } from '../parser';

export const CSSPropertyPath: Partial<
  CSSProperty<ParsedPathStyleProps['path'], ParsedPathStyleProps['path']>
> = {
  /**
   * path2Curve
   */
  parser: parsePath,

  calculator(
    name: string,
    oldParsed: ParsedPathStyleProps['path'],
    parsed: ParsedPathStyleProps['path'],
  ) {
    // unset
    if (parsed instanceof CSSKeywordValue && parsed.value === 'unset') {
      return {
        absolutePath: [],
        hasArc: false,
        segments: [],
        polygons: [],
        polylines: [],
        curve: [],
        totalLength: 0,
        curveSegments: [],
        zCommandIndexes: [],
        rect: new Rectangle(0, 0, 0, 0),
      };
    }
    return parsed;
  },

  mixer: mergePaths,

  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const { defX = 0, defY = 0 } = object.parsedStyle as ParsedPathStyleProps;
      object.setLocalPosition(defX, defY);
    }
  },
};

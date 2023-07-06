import type { AbsoluteArray } from '@antv/util';
import type {
  DisplayObject,
  ParsedPathStyleProps,
} from '../../display-objects';
import { Rectangle } from '../../shapes';
import { Shape } from '../../types';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergePaths, parsePath } from '../parser/path';

export class CSSPropertyPath
  implements
    Partial<
      CSSProperty<ParsedPathStyleProps['path'], ParsedPathStyleProps['path']>
    >
{
  /**
   * path2Curve
   */
  parser = parsePath;
  parserWithCSSDisabled = parsePath;

  calculator(
    name: string,
    oldParsed: ParsedPathStyleProps['path'],
    parsed: ParsedPathStyleProps['path'],
  ) {
    // unset
    if (parsed instanceof CSSKeywordValue && parsed.value === 'unset') {
      return {
        absolutePath: [] as unknown as AbsoluteArray,
        hasArc: false,
        segments: [],
        polygons: [],
        polylines: [],
        curve: null,
        totalLength: 0,
        rect: new Rectangle(0, 0, 0, 0),
      };
    }
    return parsed;
  }

  mixer = mergePaths;

  /**
   * update local position
   */
  postProcessor(object: DisplayObject, attributes: string[]) {
    object.parsedStyle.defX = object.parsedStyle.path.rect.x;
    object.parsedStyle.defY = object.parsedStyle.path.rect.y;

    if (
      object.nodeName === Shape.PATH &&
      attributes.indexOf('transform') === -1
    ) {
      const { defX = 0, defY = 0 } = object.parsedStyle as ParsedPathStyleProps;
      object.setLocalPosition(defX, defY);
    }
  }
}

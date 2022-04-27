import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedBaseStyleProps, CSSProperty, ParsedPathStyleProps } from '../..';
import { parsePath, mergePaths, CSSKeywordValue, Rectangle } from '../..';

@singleton()
export class CSSPropertyPath
  implements Partial<CSSProperty<ParsedPathStyleProps, ParsedPathStyleProps>>
{
  /**
   * path2Curve
   */
  parser = parsePath;

  calculator(name: string, oldParsed: ParsedPathStyleProps, parsed: ParsedPathStyleProps) {
    if (parsed instanceof CSSKeywordValue) {
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
  }

  mixer = mergePaths;

  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    const { x, y, z } = object.parsedStyle as ParsedBaseStyleProps;
    object.setLocalPosition((x && x.value) || 0, (y && y.value) || 0, (z && z.value) || 0);
  }
}

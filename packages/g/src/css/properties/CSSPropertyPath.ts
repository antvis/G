import { AbsoluteArray, CurveArray } from '@antv/util';
import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedPathStyleProps } from '../../display-objects';
import { Rectangle } from '../../shapes';
import { Shape } from '../../types';
import { CSSKeywordValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { mergePaths, parsePath } from '../parser/path';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.PATH,
  },
})
export class CSSPropertyPath
  implements Partial<CSSProperty<ParsedPathStyleProps['path'], ParsedPathStyleProps['path']>>
{
  /**
   * path2Curve
   */
  parser = parsePath;

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
        curve: [] as unknown as CurveArray,
        totalLength: 0,
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
    if (object.nodeName === Shape.PATH) {
      const { defX = 0, defY = 0 } = object.parsedStyle as ParsedPathStyleProps;
      object.setLocalPosition(defX, defY);
    }
  }
}

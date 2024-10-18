import type { AbsoluteArray } from '@antv/util';
import type { ParsedPathStyleProps } from '../../display-objects';
import { Rectangle } from '../../shapes';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergePaths, parsePath } from '../parser/path';

export class CSSPropertyPath
  implements
    Partial<CSSProperty<ParsedPathStyleProps['d'], ParsedPathStyleProps['d']>>
{
  /**
   * path2Curve
   */
  parser = parsePath;

  calculator(
    name: string,
    oldParsed: ParsedPathStyleProps['d'],
    parsed: ParsedPathStyleProps['d'],
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
}

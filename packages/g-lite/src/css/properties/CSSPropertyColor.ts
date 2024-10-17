import type { DisplayObject } from '../../display-objects';
import type { CSSGradientValue, CSSRGB } from '../cssom';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { noneColor, transparentColor } from '../CSSStyleValuePool';
import type { Pattern } from '../parser/color';
import { mergeColors, parseColor } from '../parser/color';

export class CSSPropertyColor
  implements
    Partial<
      CSSProperty<
        CSSRGB | CSSGradientValue[] | Pattern | CSSKeywordValue,
        CSSRGB | CSSGradientValue[] | Pattern
      >
    >
{
  parser = parseColor;
  calculator(
    name: string,
    oldParsed: CSSRGB | CSSGradientValue[] | CSSKeywordValue | Pattern,
    parsed: CSSRGB | CSSGradientValue[] | CSSKeywordValue | Pattern,
    object: DisplayObject,
  ) {
    if (parsed instanceof CSSKeywordValue) {
      // 'unset' 'none'
      return parsed.value === 'none' ? noneColor : transparentColor;
    }
    return parsed;
  }

  mixer = mergeColors;
}

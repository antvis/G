import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { CSSGradientValue } from '../cssom';
import { CSSKeywordValue, CSSRGB } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import type { Pattern } from '../parser/color';
import { mergeColors, parseColor } from '../parser/color';

@singleton({
  token: [
    {
      token: CSSProperty,
      named: PropertySyntax.PAINT,
    },
    {
      token: CSSProperty,
      named: PropertySyntax.COLOR,
    },
  ],
})
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
      return new CSSRGB(0, 0, 0, 0, parsed.value === 'none');
    }
    return parsed;
  }

  mixer = mergeColors;
}

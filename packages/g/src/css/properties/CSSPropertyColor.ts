import { singleton } from 'mana-syringe';
import type { CSSProperty, DisplayObject } from '../..';
import { parseColor, mergeColors } from '../..';
import { CSSGradientValue, CSSKeywordValue, CSSRGB } from '../cssom';
import { StyleValueRegistry } from '../StyleValueRegistry';

/**
 * opacity
 */
@singleton()
export class CSSPropertyColor
  implements
    Partial<CSSProperty<CSSRGB | CSSGradientValue | CSSKeywordValue, CSSRGB | CSSGradientValue>>
{
  parser = parseColor;

  calculator(
    name: string,
    oldParsed: CSSRGB | CSSGradientValue | CSSKeywordValue,
    parsed: CSSRGB | CSSGradientValue | CSSKeywordValue,
    object: DisplayObject,
    registry: StyleValueRegistry,
  ) {
    if (parsed instanceof CSSKeywordValue) {
      // 'unset' 'none'
      return new CSSRGB(0, 0, 0, 0, parsed.value === 'none');
    }
    return parsed;
  }

  mixer = mergeColors;
}

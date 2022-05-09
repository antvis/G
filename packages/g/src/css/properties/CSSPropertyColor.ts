import { singleton } from 'mana-syringe';
import type { CSSProperty } from '../CSSProperty';
import type { DisplayObject } from '../../display-objects';
import { parseColor, mergeColors } from '../parser';
import type { CSSGradientValue } from '../cssom';
import { CSSKeywordValue, CSSRGB } from '../cssom';
import type { StyleValueRegistry } from '../interfaces';

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

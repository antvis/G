import { singleton } from 'mana-syringe';
import type { CSSProperty } from '../CSSProperty';
import type { CSSKeywordValue } from '../cssom';
import type { DisplayObject } from '../../display-objects';

/**
 * should
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/visibility
 * @see https://www.w3.org/TR/CSS21/visufx.html#visibility
 *
 */
@singleton()
export class CSSPropertyVisibility
  implements Partial<CSSProperty<CSSKeywordValue, CSSKeywordValue>>
{
  calculator(
    name: string,
    oldParsed: CSSKeywordValue,
    parsed: CSSKeywordValue,
    object: DisplayObject,
  ) {
    return parsed;
  }
}

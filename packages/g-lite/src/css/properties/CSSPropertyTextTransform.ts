import type { TextTransform } from '../..';
import type { DisplayObject } from '../../display-objects';
import type { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';

/**
 * it must transform after text get parsed
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform
 */
export class CSSPropertyTextTransform
  implements Partial<CSSProperty<CSSKeywordValue, TextTransform>>
{
  calculator(
    name: string,
    oldParsed: CSSKeywordValue,
    parsed: CSSKeywordValue,
    object: DisplayObject,
  ) {
    const rawText = object.getAttribute('text');
    if (rawText) {
      let transformedText = rawText;
      if (parsed.value === 'capitalize') {
        transformedText = rawText.charAt(0).toUpperCase() + rawText.slice(1);
      } else if (parsed.value === 'lowercase') {
        transformedText = rawText.toLowerCase();
      } else if (parsed.value === 'uppercase') {
        transformedText = rawText.toUpperCase();
      }

      object.parsedStyle.text = transformedText;
    }

    return parsed.value as TextTransform;
  }
}

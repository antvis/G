import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';

export class CSSPropertyText
  implements Partial<CSSProperty<CSSKeywordValue | string, string>>
{
  calculator(
    name: string,
    oldParsed: CSSKeywordValue | string,
    parsed: CSSKeywordValue | string,
    object: DisplayObject,
  ) {
    if (parsed instanceof CSSKeywordValue) {
      if (parsed.value === 'unset') {
        return '';
      }
      return parsed.value;
    }

    // allow number as valid text content
    return `${parsed}`;
  }

  postProcessor(object: DisplayObject) {
    object.nodeValue = `${object.parsedStyle.text}` || '';
  }
}

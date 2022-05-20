import type { CSSProperty } from '../CSSProperty';
import { CSSKeywordValue } from '../cssom';
import type { DisplayObject } from '../../display-objects';

export const CSSPropertyText: Partial<CSSProperty<CSSKeywordValue | string, string>> = {
  calculator(
    name: string,
    oldParsed: CSSKeywordValue | string,
    parsed: CSSKeywordValue | string,
    object: DisplayObject,
  ) {
    if (parsed instanceof CSSKeywordValue) {
      if (parsed.value === 'unset') {
        return '';
      } else {
        return parsed.value;
      }
    }
    return parsed;
  },

  postProcessor(object: DisplayObject) {
    object.nodeValue = `${object.parsedStyle.text}` || '';
  },
};

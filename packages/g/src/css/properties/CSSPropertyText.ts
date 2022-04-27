import { singleton } from 'mana-syringe';
import type { CSSProperty, DisplayObject } from '../..';
import { CSSKeywordValue } from '../..';

@singleton()
export class CSSPropertyText implements Partial<CSSProperty<CSSKeywordValue | string, string>> {
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
  }

  postProcessor(object: DisplayObject) {
    object.nodeValue = `${object.parsedStyle.text}` || '';
  }
}

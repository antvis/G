import { singleton } from 'tsyringe';
import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';

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

import { singleton } from '@alipay/mana-syringe';
import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.TEXT,
  },
})
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

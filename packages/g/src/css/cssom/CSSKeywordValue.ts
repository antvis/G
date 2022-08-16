import { CSSStyleValue, CSSStyleValueType } from './CSSStyleValue';
import type { Nested, ParenLess } from './types';

/**
 * CSSKeywordValue represents CSS Values that are specified as keywords
 * eg. 'initial'
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSKeywordValue
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_keyword_value.idl
 */
export class CSSKeywordValue extends CSSStyleValue {
  constructor(public value: string) {
    super();
  }

  clone() {
    return new CSSKeywordValue(this.value);
  }

  getType() {
    return CSSStyleValueType.kKeywordType;
  }

  buildCSSText(n: Nested, p: ParenLess, result: string) {
    return result + this.value;
  }
}

import { CSSNumericValue } from './CSSNumericValue';

/**
 * The CSSMathValue interface of the CSS_Object_Model a base class for classes representing complex numeric values.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSMathValue
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_math_value.idl
 */
export abstract class CSSMathValue extends CSSNumericValue {
  abstract operator: string;

  // From CSSNumericValue
  isUnitValue() {
    return false;
  }

  // buildCSSText(n: Nested, p: ParenLess, s: string): string {
  //   return `calc(${s})`;
  // }

  // From CSSStyleValue
  // toCSSValue() {
  //   const node = this.toCalcExpressionNode();
  //   if (!node) return null;
  //   // return CSSMathFunctionValue.create(node);
  // }
}

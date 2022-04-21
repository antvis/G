/**
 * The CSSMathMin interface of the CSS_Object_Model represents the CSS min() function.
 * It inherits properties and methods from its parent CSSNumericValue.
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_math_min.idl
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSMathMin
 */
import { CSSMathVariadic } from './CSSMathVariadic';
import type { CSSNumericValue, CSSNumericSumValue } from '.';
import { CSSNumericValueType, CSSStyleValueType, typeCheck, Nested, ParenLess } from '.';

// Represents the minimum of one or more CSSNumericValues.
// @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
export class CSSMathMin extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const final_type = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathMin(values, final_type);
  }

  operator = 'min';

  clone() {
    return new CSSMathMin(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kMinType;
  }

  sumValue(): CSSNumericSumValue {
    let cur_min = this.numericValues()[0].sumValue();

    if (!cur_min.length) {
      return null;
    }

    for (const value of this.numericValues()) {
      const child_sum = value.sumValue();

      if (
        !child_sum.length ||
        JSON.stringify(child_sum[0].units) !== JSON.stringify(cur_min[0].units)
      ) {
        return null;
      }

      if (child_sum[0].value < cur_min[0].value) {
        cur_min = child_sum;
      }
    }

    return cur_min;
  }

  // toCalcExpressionNode() {
  //   const operands: CSSMathExpressionOperation[] = [];

  //   for (const value of this.numericValues()) {
  //     const operand = value.toCalcExpressionNode();

  //     if (!operand) {
  //       continue;
  //     }

  //     operands.push(operand as CSSMathExpressionOperation);
  //   }

  //   return CSSMathExpressionOperation.createComparisonFunction(operands, CSSMathOperator.kMin);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    result += 'min(';

    let first_iteration = true;
    for (const value of this.numericValues()) {
      if (!first_iteration) result += ', ';
      first_iteration = false;

      result = value.buildCSSText(Nested.kYes, ParenLess.kYes, result);
    }

    result += ')';

    return result;
  }
}

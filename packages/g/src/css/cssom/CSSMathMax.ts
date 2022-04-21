/**
 * The CSSMathMin interface of the CSS_Object_Model represents the CSS min() function.
 * It inherits properties and methods from its parent CSSNumericValue.
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_math_min.idl
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSMathMax
 */

import { CSSMathVariadic } from './CSSMathVariadic';
import type { CSSNumericValue, CSSNumericSumValue } from '.';
import { Nested, ParenLess, CSSNumericValueType, CSSStyleValueType, typeCheck } from '.';

// Represents the maximum of one or more CSSNumericValues.
// @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
export class CSSMathMax extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const final_type = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathMax(values, final_type);
  }

  operator = 'max';

  clone() {
    return new CSSMathMax(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kMaxType;
  }

  sumValue(): CSSNumericSumValue {
    let cur_max = this.numericValues()[0].sumValue();

    if (!cur_max.length) {
      return null;
    }

    for (const value of this.numericValues()) {
      const child_sum = value.sumValue();

      if (
        !child_sum.length ||
        JSON.stringify(child_sum[0].units) !== JSON.stringify(cur_max[0].units)
      ) {
        return null;
      }

      if (child_sum[0].value < cur_max[0].value) {
        cur_max = child_sum;
      }
    }

    return cur_max;
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

  //   return CSSMathExpressionOperation.createComparisonFunction(operands, CSSMathOperator.kMax);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    result += 'max(';

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

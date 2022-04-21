import type { CSSNumericSumValue, CSSNumericValueType, CSSNumericValue } from '.';
import { CSSMathValue } from './CSSMathValue';
import { Nested, ParenLess, CSSStyleValueType } from '.';

export class CSSMathNegate extends CSSMathValue {
  static create(value: CSSNumericValue) {
    return new CSSMathNegate(value, value.type_);
  }

  constructor(public value: CSSNumericValue, type: CSSNumericValueType) {
    super(type);
  }

  operator = 'negate';

  clone() {
    return new CSSMathNegate(this.value, this.type_);
  }

  getType() {
    return CSSStyleValueType.kNegateType;
  }

  equals(other: CSSNumericValue) {
    if (other.getType() !== CSSStyleValueType.kNegateType) {
      return false;
    }

    const other_invert = other as CSSMathNegate;
    return this.value.equals(other_invert.value);
  }

  sumValue(): CSSNumericSumValue {
    const sum = this.value.sumValue();

    if (sum.length === 0) {
      return null;
    }

    sum.forEach((term) => {
      term.value *= -1;
    });

    return sum;
  }

  // toCalcExpressionNode(): CSSMathExpressionNode {
  //   const right_side = this.value.toCalcExpressionNode();
  //   if (!right_side) {
  //     return null;
  //   }

  //   // return CSSMathExpressionOperation::CreateArithmeticOperationSimplified(
  //   //   CSSMathExpressionNumericLiteral::Create(
  //   //       -1, CSSPrimitiveValue::UnitType::kNumber),
  //   //   right_side, CSSMathOperator::kMultiply);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    result += '-';

    result = this.value.buildCSSText(Nested.kYes, ParenLess.kNo, result);

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

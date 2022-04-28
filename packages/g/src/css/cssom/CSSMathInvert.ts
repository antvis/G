import { CSSMathValue } from './CSSMathValue';
import type { CSSNumericSumValue, CSSNumericValue } from '.';
import { CSSNumericValueType, CSSStyleValueType, Nested, ParenLess } from '.';

export class CSSMathInvert extends CSSMathValue {
  static create(value: CSSNumericValue) {
    const type = CSSNumericValueType.negateExponents(value.type_);
    return new CSSMathInvert(value, type);
  }

  constructor(private value: CSSNumericValue, type: CSSNumericValueType) {
    super(type);
  }

  operator = 'invert';

  clone() {
    return new CSSMathInvert(this.value, this.type_);
  }

  getType() {
    return CSSStyleValueType.kInvertType;
  }

  equals(other: CSSNumericValue) {
    if (other.getType() !== CSSStyleValueType.kInvertType) {
      return false;
    }

    // We can safely cast here as we know 'other' has the same type as us.
    const other_invert = other as CSSMathInvert;
    return this.value.equals(other_invert.value);
  }

  sumValue(): CSSNumericSumValue {
    const sum = this.value.sumValue();

    if (sum.length === 0 || sum.length !== 1 || sum[0].value === 0) {
      return null;
    }

    Object.keys(sum[0].units).forEach((key) => {
      sum[0].units[key] *= -1;
    });

    sum[0].value = 1.0 / sum[0].value;
    return sum;
  }

  // toCalcExpressionNode(): CSSMathExpressionNode {
  //   const right_side = this.value.toCalcExpressionNode();
  //   if (!right_side) {
  //     return null;
  //   }

  //   // return CSSMathExpressionOperation::CreateArithmeticOperation(
  //   //   CSSMathExpressionNumericLiteral::Create(
  //   //       1, UnitType.kNumber),
  //   //   right_side, CSSMathOperator.kDivide);
  //   return null;
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    result += '1 / ';

    result = this.value.buildCSSText(Nested.kYes, ParenLess.kNo, result);

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

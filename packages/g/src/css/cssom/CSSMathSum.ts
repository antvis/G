import { DCHECK } from '../../utils';
import type { CSSMathNegate, CSSNumericValue, CSSNumericSumValue, UnitMap } from '.';
import { CSSMathVariadic } from './CSSMathVariadic';
import { typeCheck, CSSStyleValueType, CSSNumericValueType, Nested, ParenLess } from '.';

/**
 * Represents the sum of one or more CSSNumericValues.
 * @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
 */
export class CSSMathSum extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const finalType = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathSum(values, finalType);
  }

  static numericTypeFromUnitMap(units: UnitMap): CSSNumericValueType {
    let type = new CSSNumericValueType();

    Object.keys(units).forEach((key) => {
      const exp = units[key];
      const error = false;
      type = CSSNumericValueType.multiply(type, new CSSNumericValueType(Number(key), exp), error);
      DCHECK(!error);
    });
    return type;
  }

  static canCreateNumericTypeFromSumValue(sum: CSSNumericSumValue): boolean {
    DCHECK(!!sum.length);

    const first_type = this.numericTypeFromUnitMap(sum[0].units);

    return sum.every((term) => {
      const error = false;
      CSSNumericValueType.add(first_type, this.numericTypeFromUnitMap(term.units), error);
      return !error;
    });
  }

  operator = 'sum';

  clone() {
    return new CSSMathSum(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kSumType;
  }

  // toCalcExpressionNode() {
  //   return this.toCalcExporessionNodeForVariadic(CSSMathOperator.kAdd);
  // }

  sumValue(): CSSNumericSumValue {
    const sum: CSSNumericSumValue = [];
    this.numericValues().forEach((value) => {
      const child_sum = value.sumValue();

      if (!child_sum.length) {
        return null;
      }

      child_sum.forEach((term) => {
        const index = sum.findIndex((s) => JSON.stringify(s.units) === JSON.stringify(term.units));
        if (index === -1) {
          sum.push({ ...term });
        } else {
          sum[index].value += term.value;
        }
      });
    });

    if (!CSSMathSum.canCreateNumericTypeFromSumValue(sum)) return null;

    return sum;
  }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    const values = this.numericValues();
    result = values[0].buildCSSText(Nested.kYes, ParenLess.kNo, result);

    for (let i = 1; i < values.length; i++) {
      const arg = values[i];
      if (arg.getType() === CSSStyleValueType.kNegateType) {
        result += ' - ';
        result = (arg as CSSMathNegate).value.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      } else {
        result += ' + ';
        result = arg.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      }
    }

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

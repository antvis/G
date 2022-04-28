import { DCHECK_NE } from '../../utils';
import type { CSSMathNegate, CSSNumericValue, CSSNumericSumValue, UnitMap } from '.';
import { CSSMathVariadic } from './CSSMathVariadic';
import { typeCheck, CSSStyleValueType, CSSNumericValueType, Nested, ParenLess } from '.';

/**
 * Represents the product of one or more CSSNumericValues.
 * @see https://drafts.css-houdini.org/css-typed-om/#cssmathproduct
 */
export class CSSMathProduct extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const finalType = typeCheck(values, CSSNumericValueType.multiply, error);
    return error ? null : new CSSMathProduct(values, finalType);
  }

  static multiplyUnitMaps(a: UnitMap, b: UnitMap): UnitMap {
    Object.keys(b).forEach((key) => {
      DCHECK_NE(b[key].value, 0);
      const old_value = key in a ? a[key].value : 0;
      if (old_value + b[key].value === 0) {
        delete a[key];
      } else {
        a[key] = old_value + b[key].value;
      }
    });
    return a;
  }

  operator = 'product';

  clone() {
    return new CSSMathProduct(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kProductType;
  }

  // toCalcExpressionNode() {
  //   return this.toCalcExporessionNodeForVariadic(CSSMathOperator.kMultiply);
  // }

  sumValue(): CSSNumericSumValue {
    let sum: CSSNumericSumValue = [
      {
        value: 1,
        units: {} as UnitMap,
      },
    ];
    this.numericValues().forEach((value) => {
      const child_sum = value.sumValue();

      if (!child_sum.length) {
        return null;
      }

      const new_sum: CSSNumericSumValue = [];
      sum.forEach((a) => {
        child_sum.forEach((b) => {
          new_sum.push({
            value: a.value * b.value,
            units: CSSMathProduct.multiplyUnitMaps(a.units, b.units),
          });
        });
      });
      sum = new_sum;
    });

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
      if (arg.getType() === CSSStyleValueType.kInvertType) {
        result += ' / ';
        result = (arg as CSSMathNegate).value.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      } else {
        result += ' * ';
        result = arg.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      }
    }

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

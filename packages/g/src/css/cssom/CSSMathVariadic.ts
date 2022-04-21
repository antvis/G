import { CSSMathValue } from './CSSMathValue';
import type { CSSNumericValue, CSSNumericValueType } from '.';

export function typeCheck(
  values: CSSNumericValue[],
  op: Function,
  error: boolean,
): CSSNumericValueType {
  error = false;

  let final_type = values[0].type_;
  for (let i = 1; i < values.length; i++) {
    final_type = op(final_type, values[i].type_, error);
    if (error) return final_type;
  }

  return final_type;
}

// Represents an arithmetic operation with one or more CSSNumericValues.
export abstract class CSSMathVariadic extends CSSMathValue {
  constructor(public values: CSSNumericValue[], type: CSSNumericValueType) {
    super(type);
  }

  numericValues() {
    return this.values;
  }

  equals(other: CSSNumericValue) {
    if (this.getType() !== other.getType()) {
      return false;
    }

    return this.values.every((value, i) => value.equals((other as CSSMathVariadic).values[i]));
  }

  // toCalcExporessionNodeForVariadic(op: CSSMathOperator) {
  //   let node = this.numericValues()[0].toCalcExpressionNode();
  //   if (!node) {
  //     return null;
  //   }

  //   this.numericValues().forEach((value) => {
  //     const next_arg = value.toCalcExpressionNode();
  //     if (!next_arg) {
  //       return null;
  //     }

  //     node = CSSMathExpressionOperation.createArithmeticOperation(node, next_arg, op);
  //   });

  //   return node;
  // }
}

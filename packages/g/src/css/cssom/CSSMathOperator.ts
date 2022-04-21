export enum CSSMathOperator {
  kAdd = '+',
  kSubtract = '-',
  kMultiply = '*',
  kDivide = '/',
  kMin = 'min',
  kMax = 'max',
  kClamp = 'clamp',
  kInvalid = '',
}

// export function parseCSSArithmeticOperator(token: CSSParserToken) {
//   if (token.GetType() !== kDelimiterToken)
//     return CSSMathOperator.kInvalid;
//   switch (token.Delimiter()) {
//     case '+':
//       return CSSMathOperator.kAdd;
//     case '-':
//       return CSSMathOperator.kSubtract;
//     case '*':
//       return CSSMathOperator.kMultiply;
//     case '/':
//       return CSSMathOperator.kDivide;
//     default:
//       return CSSMathOperator.kInvalid;
//   }
// }

export function isComparison(op: CSSMathOperator) {
  return (
    op === CSSMathOperator.kMin || op === CSSMathOperator.kMax || op === CSSMathOperator.kClamp
  );
}

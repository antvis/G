import { numberToString, clamp } from './numeric';
import { addPropertiesHandler } from '../Interpolation';

// In calc expressions, white space is required on both sides of the
// + and - operators. https://drafts.csswg.org/css-values-3/#calc-notation
// Thus any + or - immediately adjacent to . or 0..9 is part of the number,
// e.g. -1.23e+45
// This regular expression matches ( ) * / + - and numbers.
const tokenRegularExpression = /([\+\-\w\.]+|[\(\)\*\/])/g;

// Evaluates a calc expression.
// https://drafts.csswg.org/css-values-3/#calc-notation
function calculate(expression: string) {
  let currentToken: string | undefined;
  function consume() {
    const matchResult = tokenRegularExpression.exec(expression);
    if (matchResult) {
      currentToken = matchResult[0];
    } else {
      currentToken = undefined;
    }
  }
  consume(); // Read the initial token.

  function calcNumber() {
    // https://drafts.csswg.org/css-values-3/#number-value
    const result = Number(currentToken);
    consume();
    return result;
  }

  function calcValue(): number {
    // <calc-value> = <number> | <dimension> | <percentage> | ( <calc-sum> )
    if (currentToken !== '(')
      return calcNumber();
    consume();
    const result = calcSum();
    // @ts-ignore
    if (currentToken !== ')')
      return NaN;
    consume();
    return result;
  }

  function calcProduct() {
    // <calc-product> = <calc-value> [ '*' <calc-value> | '/' <calc-number-value> ]*
    let left = calcValue();
    while (currentToken === '*' || currentToken === '/') {
      const operator = currentToken;
      consume();
      const right = calcValue();
      if (operator === '*')
        left *= right;
      else
        left /= right;
    }
    return left;
  }

  function calcSum() {
    // <calc-sum> = <calc-product> [ [ '+' | '-' ] <calc-product> ]*
    let left = calcProduct();
    while (currentToken === '+' || currentToken === '-') {
      const operator = currentToken;
      consume();
      const right = calcProduct();
      if (operator === '+')
        left += right;
      else
        left -= right;
    }
    return left;
  }

  // <calc()> = calc( <calc-sum> )
  return calcSum();
}

function parseDimension(unitRegExp: RegExp, string: string) {
  string = string.trim().toLowerCase();

  // 0 -> 0px
  if (string === '0' && 'px'.search(unitRegExp) >= 0)
    return { px: 0 };

  // If we have parenthesis, we're a calc and need to start with 'calc'.
  if (!/^[^(]*$|^calc/.test(string))
    return;
  string = string.replace(/calc\(/g, '(');

  // We tag units by prefixing them with 'U' (note that we are already
  // lowercase) to prevent problems with types which are substrings of
  // each other (although prefixes may be problematic!)
  const matchedUnits: Record<string, null | number> = {};
  string = string.replace(unitRegExp, function (match) {
    matchedUnits[match] = null;
    return 'U' + match;
  });
  const taggedUnitRegExp = 'U(' + unitRegExp.source + ')';

  // Validating input is simply applying as many reductions as we can.
  let typeCheck = string.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g, 'N')
    .replace(new RegExp('N' + taggedUnitRegExp, 'g'), 'D')
    .replace(/\s[+-]\s/g, 'O')
    .replace(/\s/g, '');
  const reductions = [/N\*(D)/g, /(N|D)[*/]N/g, /(N|D)O\1/g, /\((N|D)\)/g];
  let i = 0;
  while (i < reductions.length) {
    if (reductions[i].test(typeCheck)) {
      typeCheck = typeCheck.replace(reductions[i], '$1');
      i = 0;
    } else {
      i++;
    }
  }
  if (typeCheck != 'D')
    return;

  for (const unit in matchedUnits) {
    const result = calculate(string.replace(new RegExp('U' + unit, 'g'), '').replace(new RegExp(taggedUnitRegExp, 'g'), '*0'));
    if (!isFinite(result))
      return;
    matchedUnits[unit] = result;
  }
  return matchedUnits;
}

function mergeDimensionsNonNegative(left, right) {
  return mergeDimensions(left, right, true);
}

export function mergeDimensions(
  left: Record<string, number>,
  right: Record<string, number>,
  nonNegative?: boolean,
) {
  const units: string[] = [];
  let unit: string;
  for (unit in left)
    units.push(unit);
  for (unit in right) {
    if (units.indexOf(unit) < 0)
      units.push(unit);
  }

  left = units.map(function (unit) { return left[unit] || 0; });
  right = units.map(function (unit) { return right[unit] || 0; });
  return [left, right, function (values) {
    const result = values.map(function (value, i) {
      if (values.length == 1 && nonNegative) {
        value = Math.max(value, 0);
      }
      // Scientific notation (e.g. 1e2) is not yet widely supported by browser vendors.
      return numberToString(value) + units[i];
    }).join(' + ');
    return values.length > 1 ? 'calc(' + result + ')' : result;
  }];
}

// const lengthUnits = 'px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc';
const lengthUnits = 'px';
export const parseLength = parseDimension.bind(null, new RegExp(lengthUnits, 'g'));
export const parseLengthOrPercent = parseDimension.bind(null, new RegExp(lengthUnits + '|%', 'g'));
export const parseAngle = parseDimension.bind(null, /deg|rad|grad|turn/g);

// addPropertiesHandler(parseLengthOrPercent, mergeDimensionsNonNegative, [
//   'r',
//   'width',
//   'height',
// ]);
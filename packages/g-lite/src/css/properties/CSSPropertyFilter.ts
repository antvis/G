import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import type { ParsedFilterStyleProperty } from '../parser';

export class CSSPropertyFilter
  implements
    Partial<
      CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>
    >
{
  calculator(
    name: string,
    oldParsed: ParsedFilterStyleProperty[],
    parsed: ParsedFilterStyleProperty[],
  ) {
    // unset or none
    if (parsed instanceof CSSKeywordValue) {
      return [];
    }
    return parsed;
  }
}

import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import type { ParsedFilterStyleProperty } from '../parser';
import { parseFilter } from '../parser/filter';

export class CSSPropertyFilter
  implements
    Partial<
      CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>
    >
{
  parser = parseFilter;

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

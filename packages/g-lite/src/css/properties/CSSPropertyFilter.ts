import { singleton } from 'mana-syringe';
import { CSSKeywordValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import type { ParsedFilterStyleProperty } from '../parser';
import { parseFilter } from '../parser/filter';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.FILTER,
  },
})
export class CSSPropertyFilter
  implements Partial<CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>>
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

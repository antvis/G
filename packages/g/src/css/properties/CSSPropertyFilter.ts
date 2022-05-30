import { singleton } from 'mana-syringe';
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
}

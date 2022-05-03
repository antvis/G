import { singleton } from 'mana-syringe';
import type { CSSProperty } from '../CSSProperty';
import type { ParsedFilterStyleProperty } from '../parser';
import { parseFilter } from '../parser';

@singleton()
export class CSSPropertyFilter
  implements Partial<CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>>
{
  parser = parseFilter;
}

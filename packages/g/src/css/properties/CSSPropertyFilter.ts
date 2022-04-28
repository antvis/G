import { singleton } from 'mana-syringe';
import type { CSSProperty, ParsedFilterStyleProperty } from '../..';
import { parseFilter } from '../..';

@singleton()
export class CSSPropertyFilter
  implements Partial<CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>>
{
  parser = parseFilter;
}

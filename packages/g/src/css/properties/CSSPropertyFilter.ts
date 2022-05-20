import type { CSSProperty } from '../CSSProperty';
import type { ParsedFilterStyleProperty } from '../parser';
import { parseFilter } from '../parser';

export const CSSPropertyFilter: Partial<
  CSSProperty<ParsedFilterStyleProperty[], ParsedFilterStyleProperty[]>
> = {
  parser: parseFilter,
};

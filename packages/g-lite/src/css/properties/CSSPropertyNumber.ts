import { singleton } from 'tsyringe';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { mergeNumbers, parseNumber } from '../parser/numeric';

@singleton()
export class CSSPropertyNumber implements Partial<CSSProperty<CSSUnitValue, number>> {
  mixer = mergeNumbers;
  parser = parseNumber;
  calculator(name: string, oldParsed: CSSUnitValue, computed: CSSUnitValue): number {
    return computed.value;
  }
}

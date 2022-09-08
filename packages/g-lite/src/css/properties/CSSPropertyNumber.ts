import { singleton } from '@alipay/mana-syringe';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { mergeNumbers, parseNumber } from '../parser/numeric';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.NUMBER,
  },
})
export class CSSPropertyNumber implements Partial<CSSProperty<CSSUnitValue, number>> {
  mixer = mergeNumbers;
  parser = parseNumber;
  calculator(name: string, oldParsed: CSSUnitValue, computed: CSSUnitValue): number {
    return computed.value;
  }
}

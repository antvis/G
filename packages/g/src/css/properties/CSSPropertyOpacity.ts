import { singleton } from 'mana-syringe';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { clampedMergeNumbers, parseNumber } from '../parser/numeric';

/**
 * opacity
 */
@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.OPACITY_VALUE,
  },
})
export class CSSPropertyOpacity implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseNumber;

  calculator(name: string, oldParsed: CSSUnitValue, computed: CSSUnitValue): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);
}

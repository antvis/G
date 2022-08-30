import { singleton } from 'tsyringe';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { clampedMergeNumbers, parseNumber } from '../parser/numeric';

/**
 * opacity
 */
@singleton()
export class CSSPropertyOpacity implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseNumber;

  calculator(name: string, oldParsed: CSSUnitValue, computed: CSSUnitValue): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);
}

import { singleton } from 'mana-syringe';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { parseNumber, clampedMergeNumbers } from '../parser';

/**
 * opacity
 */
@singleton()
export class CSSPropertyOpacity implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> {
  parser = parseNumber;

  mixer = clampedMergeNumbers(0, 1);
}

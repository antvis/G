import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { parseNumber, clampedMergeNumbers } from '../parser';

/**
 * opacity
 */
export const CSSPropertyOpacity: Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> = {
  parser: parseNumber,

  mixer: clampedMergeNumbers(0, 1),
};

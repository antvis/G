import { singleton } from 'mana-syringe';
import type { CSSUnitValue, CSSProperty} from '../..';
import { parseNumber, clampedMergeNumbers } from '../..';

/**
 * opacity
 */
@singleton()
export class CSSPropertyOpacity implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> {
  parser = parseNumber;

  mixer = clampedMergeNumbers(0, 1);
}

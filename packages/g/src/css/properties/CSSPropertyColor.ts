import { singleton } from 'mana-syringe';
import type { CSSProperty} from '../..';
import { parseColor, mergeColors } from '../..';
import type { CSSGradientValue, CSSRGB } from '../cssom';

/**
 * opacity
 */
@singleton()
export class CSSPropertyColor
  implements Partial<CSSProperty<CSSRGB | CSSGradientValue, CSSRGB | CSSGradientValue>>
{
  parser = parseColor;
  mixer = mergeColors;
}

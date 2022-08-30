import { singleton } from 'tsyringe';
import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { mergeNumbers } from '../parser';
import { convertAngleUnit, parseAngle } from '../parser/dimension';

@singleton()
export class CSSPropertyAngle implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseAngle;

  mixer = mergeNumbers;

  calculator(name: string, oldParsed: CSSUnitValue, parsed: CSSUnitValue, object: DisplayObject) {
    return convertAngleUnit(parsed);
  }
}

import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { mergeNumbers } from '../parser';
import { convertAngleUnit, parseAngle } from '../parser/dimension';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.ANGLE,
  },
})
export class CSSPropertyAngle implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseAngle;

  mixer = mergeNumbers;

  calculator(name: string, oldParsed: CSSUnitValue, parsed: CSSUnitValue, object: DisplayObject) {
    return convertAngleUnit(parsed);
  }
}

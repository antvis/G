import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { convertAngleUnit, mergeDimensions, parseAngle } from '../parser/dimension';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.ANGLE,
  },
})
export class CSSPropertyAngle implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> {
  parser = parseAngle;
  mixer = mergeDimensions;
  calculator(name: string, oldParsed: CSSUnitValue, parsed: CSSUnitValue, object: DisplayObject) {
    return new CSSUnitValue(convertAngleUnit(parsed), 'deg');
  }
}

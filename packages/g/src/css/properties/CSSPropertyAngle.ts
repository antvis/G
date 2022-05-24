import type { DisplayObject } from '../../display-objects';
import { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { convertAngleUnit, mergeDimensions, parseAngle } from '../parser';

export const CSSPropertyAngle: Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> = {
  parser: parseAngle,
  mixer: mergeDimensions,
  calculator(name: string, oldParsed: CSSUnitValue, parsed: CSSUnitValue, object: DisplayObject) {
    return new CSSUnitValue(convertAngleUnit(parsed), 'deg');
  },
};

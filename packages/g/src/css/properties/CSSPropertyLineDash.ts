import { singleton } from 'mana-syringe';
import type {
  CSSProperty,
  CSSUnitValue,
  DisplayObject} from '../..';
import {
  parseDimensionArray,
  mergeDimensionList
} from '../..';

@singleton()
export class CSSPropertyLineDash implements Partial<CSSProperty<CSSUnitValue[], CSSUnitValue[]>> {
  parser = parseDimensionArray;

  mixer = mergeDimensionList;

  calculator(
    name: string,
    oldParsed: CSSUnitValue[],
    parsed: CSSUnitValue[],
    object: DisplayObject,
  ) {
    if (parsed && parsed.length === 1) {
      return [parsed[0], parsed[0]];
    }

    return [parsed[0], parsed[1]];
  }
}

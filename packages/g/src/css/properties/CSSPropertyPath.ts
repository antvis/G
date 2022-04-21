import { singleton } from 'mana-syringe';
import type {
  DisplayObject,
  ParsedBaseStyleProps,
  CSSProperty,
  ParsedPathStyleProps} from '../..';
import {
  parsePath,
  mergePaths
} from '../..';

@singleton()
export class CSSPropertyPath
  implements Partial<CSSProperty<ParsedPathStyleProps, ParsedPathStyleProps>>
{
  /**
   * path2Curve
   */
  parser = parsePath;

  mixer = mergePaths;

  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    const { x, y, z } = object.parsedStyle as ParsedBaseStyleProps;
    object.setLocalPosition((x && x.value) || 0, (y && y.value) || 0, (z && z.value) || 0);
  }
}

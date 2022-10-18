import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { parseTransformOrigin } from '../parser/transform-origin';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin
 * @example
 * [10px, 10px] [10%, 10%]
 */
export class CSSPropertyTransformOrigin
  implements Partial<CSSProperty<[CSSUnitValue, CSSUnitValue], [CSSUnitValue, CSSUnitValue]>>
{
  parser = parseTransformOrigin;

  // calculator(
  //   name: string,
  //   oldParsed: [CSSUnitValue, CSSUnitValue],
  //   parsed: [CSSUnitValue, CSSUnitValue],
  //   object: DisplayObject,
  // ): [number, number] {
  //   console.log(object, parsed);

  //   return [parsed[0].value, parsed[1].value];
  //   // return [convertPercentUnit(parsed[0], 0, object), convertPercentUnit(parsed[1], 1, object)];
  // }
}

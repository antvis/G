import { isNil, isNumber } from '@antv/util';
import type {
  DisplayObject,
  ParsedTextStyleProps,
} from '../../display-objects';
import type { GlobalRuntime } from '../../global-runtime';
import type { CSSProperty } from '../CSSProperty';
import { CSSUnitValue, UnitType } from '../cssom';
import { mergeNumbers } from '../parser';
import { parseLengthOrPercentage } from '../parser/dimension';

function getFontSize(object: DisplayObject): number {
  const { fontSize } = object.parsedStyle as ParsedTextStyleProps;
  return isNil(fontSize) ? null : fontSize;
}

/**
 * <length> & <percentage>
 */
export class CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  parser = parseLengthOrPercentage;
  parserWithCSSDisabled = null;

  mixer = mergeNumbers;

  /**
   * according to parent's bounds
   *
   * @example
   * CSS.percent(50) -> CSS.px(0.5 * parent.width)
   */
  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
    object: DisplayObject,
    runtime: GlobalRuntime,
  ): number {
    if (isNumber(computed)) {
      return computed;
    }

    if (CSSUnitValue.isRelativeUnit(computed.unit)) {
      const registry = runtime.styleValueRegistry;

      if (computed.unit === UnitType.kPercentage) {
        // TODO: merge dimensions
        return 0;
      } else if (computed.unit === UnitType.kEms) {
        if (object.parentNode) {
          let fontSize = getFontSize(object.parentNode as DisplayObject);
          if (fontSize) {
            fontSize *= computed.value;
            return fontSize;
          } else {
            registry.addUnresolveProperty(object, name);
          }
        } else {
          registry.addUnresolveProperty(object, name);
        }
        return 0;
      } else if (computed.unit === UnitType.kRems) {
        if (object?.ownerDocument?.documentElement) {
          let fontSize = getFontSize(
            object.ownerDocument.documentElement as DisplayObject,
          );

          if (fontSize) {
            fontSize *= computed.value;
            return fontSize;
          } else {
            registry.addUnresolveProperty(object, name);
          }
        } else {
          registry.addUnresolveProperty(object, name);
        }
        return 0;
      }
    } else {
      // remove listener if exists
      // registry.unregisterParentGeometryBoundsChangedHandler(object, name);

      // return absolute value
      return computed.value;
    }
  }
}

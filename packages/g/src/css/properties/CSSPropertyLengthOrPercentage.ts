import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedTextStyleProps } from '../../display-objects';
import { CSSUnitValue, UnitType } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import type { StyleValueRegistry } from '../interfaces';
import { PropertySyntax } from '../interfaces';
import { mergeDimensions, parseLengthOrPercentage } from '../parser/dimension';

function getFontSize(object: DisplayObject): CSSUnitValue {
  const { fontSize } = object.parsedStyle as ParsedTextStyleProps;
  if (fontSize && !CSSUnitValue.isRelativeUnit(fontSize.unit)) {
    return fontSize.clone();
  }
  return null;
}

/**
 * <length> & <percentage>
 */
@singleton({
  token: [
    {
      token: CSSProperty,
      named: PropertySyntax.LENGTH_PERCENTAGE,
    },
    {
      token: CSSProperty,
      named: PropertySyntax.LENGTH,
    },
  ],
})
export class CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  parser = parseLengthOrPercentage;
  mixer = mergeDimensions;

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
    registry: StyleValueRegistry,
  ): CSSUnitValue {
    if (CSSUnitValue.isRelativeUnit(computed.unit)) {
      if (computed.unit === UnitType.kPercentage) {
        return new CSSUnitValue(0, 'px');
      } else if (computed.unit === UnitType.kEms) {
        if (object.parentNode) {
          const fontSize = getFontSize(object.parentNode as DisplayObject);

          if (fontSize) {
            fontSize.value *= computed.value;
            return fontSize;
          } else {
            registry.addUnresolveProperty(object, name);
          }
        } else {
          registry.addUnresolveProperty(object, name);
        }
        return new CSSUnitValue(0, 'px');
      } else if (computed.unit === UnitType.kRems) {
        if (object?.ownerDocument?.documentElement) {
          const fontSize = getFontSize(object.ownerDocument.documentElement as DisplayObject);

          if (fontSize) {
            fontSize.value *= computed.value;
            return fontSize;
          } else {
            registry.addUnresolveProperty(object, name);
          }
        } else {
          registry.addUnresolveProperty(object, name);
        }
        return new CSSUnitValue(0, 'px');
      }
    } else {
      // remove listener if exists
      // registry.unregisterParentGeometryBoundsChangedHandler(object, name);

      // return absolute value
      return computed.clone();
    }
  }
}

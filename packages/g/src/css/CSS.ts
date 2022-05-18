import { GlobalContainer } from 'mana-syringe';
import { CSSUnitValue } from './cssom';
import type { PropertySyntax } from './interfaces';
import { StyleValueRegistry } from './interfaces';
import type { LayoutDefinitionCtor } from './layout';
import { LayoutRegistry } from './layout';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty#parameters
 */
export interface PropertyDefinition {
  name: string;
  /**
   * representing the expected syntax of the defined property. Defaults to "*".
   */
  syntax: PropertySyntax;
  /**
   * A boolean value defining whether the defined property should be inherited (true), or not (false). Defaults to false.
   */
  inherits?: boolean;
  interpolable?: boolean;
  initialValue?: string;
}

/**
 * holds useful CSS-related methods.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS
 *
 * * CSS Typed OM @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/factory_functions
 * * register property @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty
 * * CSS Layout API
 */
export const CSS = {
  /**
   * <number>
   * @see https://drafts.csswg.org/css-values-4/#number-value
   */
  number: (n: number) => {
    return new CSSUnitValue(n);
  },

  /**
   * <percentage>
   * @see https://drafts.csswg.org/css-values-4/#percentage-value
   */
  percent: (n: number) => {
    return new CSSUnitValue(n, '%');
  },

  /**
   * <length>
   */
  px: (n: number) => {
    return new CSSUnitValue(n, 'px');
  },

  /**
   * <length>
   */
  em: (n: number) => {
    return new CSSUnitValue(n, 'em');
  },

  /**
   * <angle>
   */
  deg: (n: number) => {
    return new CSSUnitValue(n, 'deg');
  },

  /**
   * <angle>
   */
  grad: (n: number) => {
    return new CSSUnitValue(n, 'grad');
  },

  /**
   * <angle>
   */
  rad: (n: number) => {
    return new CSSUnitValue(n, 'rad');
  },

  /**
   * <angle>
   */
  turn: (n: number) => {
    return new CSSUnitValue(n, 'turn');
  },

  /**
   * <time>
   */
  s: (n: number) => {
    return new CSSUnitValue(n, 's');
  },

  /**
   * <time>
   */
  ms: (n: number) => {
    return new CSSUnitValue(n, 'ms');
  },

  /**
   * CSS Properties & Values API
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API
   * @see https://drafts.css-houdini.org/css-properties-values-api/#registering-custom-properties
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty
   */
  registerProperty: (definition: PropertyDefinition) => {
    const { name, inherits, interpolable, initialValue, syntax } = definition;

    const registry = GlobalContainer.get<StyleValueRegistry>(StyleValueRegistry);
    registry.registerMetadata({
      name,
      inherited: inherits,
      interpolable,
      defaultValue: initialValue,
      syntax,
    });
  },

  /**
   * CSS Layout API
   * register layout
   *
   * @see https://github.com/w3c/css-houdini-drafts/blob/main/css-layout-api/EXPLAINER.md
   * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini#css_layout_api
   */
  registerLayout: (name: string, clazz: LayoutDefinitionCtor) => {
    const layoutRegistry = GlobalContainer.get(LayoutRegistry);
    layoutRegistry.registerLayout(name, clazz);
  },
};

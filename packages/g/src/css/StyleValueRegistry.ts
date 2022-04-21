import { postConstruct, singleton, GlobalContainer } from 'mana-syringe';
import { vec3 } from 'gl-matrix';
import type { DisplayObject, ParsedBaseStyleProps, GeometryAABBUpdater, BaseStyleProps } from '..';
import { ElementEvent } from '..';
import { dirtifyToRoot, Shape, GeometryUpdaterFactory, AABB } from '..';
import { CSSStyleValue, CSSUnitValue } from './cssom';
import { CSSKeywordValue } from './cssom';
import type { ParsedFilterStyleProperty } from './parser';
import {
  CSSPropertyLocalPosition,
  CSSPropertyOpacity,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLengthOrPercentage,
  CSSPropertyLineDash,
  CSSPropertyShadowBlur,
  CSSPropertyOffsetPath,
  CSSPropertyOffsetDistance,
  CSSPropertyAnchor,
  CSSPropertyZIndex,
  CSSPropertyTransform,
  CSSPropertyTransformOrigin,
  CSSPropertyPath,
  CSSPropertyClipPath,
  CSSPropertyPoints,
  CSSPropertyText,
  CSSPropertyTextTransform,
  CSSPropertyVisibility,
} from './properties';
import type { CSSProperty } from './CSSProperty';
import { formatAttribute } from '../utils';

export interface PropertyMetadata {
  name: string;

  /**
   * The interpolable flag indicates whether a property can be animated smoothly.
   * Default to `false`.
   */
  interpolable?: boolean;

  /**
   * The property will inherit by default if no value is specified.
   * Default to `false`.
   */
  inherited?: boolean;

  /**
   * This property affects only one field on ComputedStyle, and can be set
   * directly during inheritance instead of forcing a recalc.
   */
  independent?: boolean;

  /**
   * This specifies the default value for this field.
   * - for keyword fields, this is the initial keyword
   * - for other fields, this is a string containg the C++ expression that is used to initialise the field.
   */
  defaultValue?: string;

  /**
   * The resolved value used for getComputedStyle() depends on layout for this
   * property, which means we may need to update layout to return the correct
   * value from getComputedStyle().
   */
  layoutDependent?: boolean;

  /**
   * This specifies all valid keyword values for the property.
   */
  keywords?: string[];

  /**
   * eg. strokeWidth is an alias of lineWidth
   */
  alias?: string[];

  /**
   * sort before init attributes according to this priority
   */
  parsePriority?: number;

  handler?: any;
}

/**
 * Blink used them in code generation(css_properties.json5)
 */
export const BUILT_IN_PROPERTIES: PropertyMetadata[] = [
  {
    /**
     * used in CSS Layout API
     * eg. `display: 'flex'`
     */
    name: 'display',
    keywords: ['none'],
  },
  {
    // x in local space
    name: 'x',
    interpolable: true,
    alias: ['cx'],
    handler: CSSPropertyLocalPosition,
  },
  {
    // y in local space
    name: 'y',
    interpolable: true,
    alias: ['cy'],
    handler: CSSPropertyLocalPosition,
  },
  {
    // z in local space
    name: 'z',
    interpolable: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    /**
     * range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
     */
    name: 'opacity',
    interpolable: true,
    defaultValue: '1',
    handler: CSSPropertyOpacity,
  },
  {
    /**
     * range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-opacity
     */
    name: 'fillOpacity',
    interpolable: true,
    inherited: true,
    defaultValue: '1',
    handler: CSSPropertyOpacity,
  },
  {
    /**
     * range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-opacity
     */
    name: 'strokeOpacity',
    interpolable: true,
    inherited: true,
    defaultValue: '1',
    handler: CSSPropertyOpacity,
  },
  {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Fills_and_Strokes
     */
    name: 'fill',
    interpolable: true,
    inherited: true,
    defaultValue: 'transparent',
    handler: CSSPropertyColor,
  },
  {
    name: 'stroke',
    interpolable: true,
    inherited: true,
    defaultValue: 'transparent',
    handler: CSSPropertyColor,
  },
  {
    name: 'shadowColor',
    interpolable: true,
    handler: CSSPropertyColor,
  },
  {
    name: 'shadowOffsetX',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'shadowOffsetY',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'shadowBlur',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyShadowBlur,
  },
  {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width
     */
    name: 'lineWidth',
    interpolable: true,
    inherited: true,
    defaultValue: '1',
    layoutDependent: true,
    alias: ['strokeWidth'],
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'lineDash',
    interpolable: true,
    inherited: true,
    keywords: ['none'],
    alias: ['strokeDasharray'],
    handler: CSSPropertyLineDash,
  },
  {
    name: 'lineDashOffset',
    interpolable: true,
    inherited: true,
    defaultValue: '0',
    alias: ['strokeDashoffset'],
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'offsetPath',
    handler: CSSPropertyOffsetPath,
  },
  {
    name: 'offsetDistance',
    interpolable: true,
    handler: CSSPropertyOffsetDistance,
  },
  {
    name: 'dx',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'dy',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'zIndex',
    independent: true,
    interpolable: true,
    defaultValue: '0',
    keywords: ['auto'],
    handler: CSSPropertyZIndex,
  },
  {
    name: 'visibility',
    keywords: ['visible', 'hidden'],
    independent: true,
    inherited: true,
    /**
     * TODO: support interpolation
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#interpolation
     */
    // interpolable: true,
    defaultValue: 'visible',
    handler: CSSPropertyVisibility,
  },
  {
    name: 'interactive',
    defaultValue: 'true',
  },
  {
    name: 'filter',
    independent: true,
    handler: CSSPropertyFilter,
  },
  {
    name: 'clipPath',
    handler: CSSPropertyClipPath,
  },
  {
    name: 'transform',
    interpolable: true,
    keywords: ['none'],
    handler: CSSPropertyTransform,
  },
  {
    name: 'transformOrigin',
    parsePriority: 100,
    // interpolable: true,
    defaultValue: 'left top',
    handler: CSSPropertyTransformOrigin,
  },
  {
    name: 'anchor',
    handler: CSSPropertyAnchor,
  },
  // Circle
  {
    name: 'r',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'rx',
    interpolable: true,
    layoutDependent: true,
    defaultValue: 'auto',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'ry',
    interpolable: true,
    layoutDependent: true,
    defaultValue: 'auto',
    handler: CSSPropertyLengthOrPercentage,
  },
  // Rect Image
  {
    name: 'width',
    interpolable: true,
    layoutDependent: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/width
     */
    keywords: ['auto', 'fit-content', 'min-content', 'max-content'],
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'height',
    interpolable: true,
    layoutDependent: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/height
     */
    keywords: ['auto', 'fit-content', 'min-content', 'max-content'],
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'radius',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    handler: CSSPropertyLengthOrPercentage,
  },
  // Line
  {
    name: 'x1',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    name: 'y1',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    name: 'z1',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    name: 'x2',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    name: 'y2',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  {
    name: 'z2',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyLocalPosition,
  },
  // Path
  {
    name: 'path',
    interpolable: true,
    layoutDependent: true,
    handler: CSSPropertyPath,
  },
  // Polyline
  {
    name: 'points',
    layoutDependent: true,
    handler: CSSPropertyPoints,
  },
  // Text
  {
    name: 'text',
    layoutDependent: true,
    handler: CSSPropertyText,
  },
  {
    name: 'textTransform',
    layoutDependent: true,
    handler: CSSPropertyTextTransform,
  },
  {
    name: 'font',
    layoutDependent: true,
  },
  {
    name: 'fontSize',
    interpolable: true,
    inherited: true,
    defaultValue: '16px',
    layoutDependent: true,
    handler: CSSPropertyLengthOrPercentage,
  },
  {
    name: 'fontFamily',
    layoutDependent: true,
    inherited: true,
    defaultValue: 'sans-serif',
  },
  {
    name: 'fontStyle',
    layoutDependent: true,
    inherited: true,
  },
  {
    name: 'fontWeight',
    layoutDependent: true,
    inherited: true,
  },
  {
    name: 'fontVariant',
    layoutDependent: true,
    inherited: true,
  },
  {
    name: 'lineHeight',
    layoutDependent: true,
    // interpolable: true,
    // inherited: true,
    // defaultValue: '-100%'
  },
  {
    name: 'letterSpacing',
    layoutDependent: true,
    // interpolable: true,
    // inherited: true,
  },
  {
    name: 'wordWrap',
    layoutDependent: true,
  },
  {
    name: 'wordWrapWidth',
    layoutDependent: true,
  },
  {
    name: 'leading',
    layoutDependent: true,
  },
  {
    name: 'textBaseline',
    layoutDependent: true,
  },
  {
    name: 'textAlign',
    layoutDependent: true,
    inherited: true,
    defaultValue: 'start',
  },
  {
    name: 'whiteSpace',
    layoutDependent: true,
  },
];

@singleton()
export class StyleValueRegistry {
  /**
   * need recalc later
   */
  dirty = false;

  private cache: Record<string, PropertyMetadata> = {};

  private unresolvedProperties: Record<number, string[]> = {};

  private boundsChangeListeners: Record<
    /**
     * parent's entity
     */
    number,
    Record<
      /**
       * child's entity
       */
      number,
      /**
       * child properties
       */
      string[]
    >
  > = {};

  @postConstruct()
  init() {
    BUILT_IN_PROPERTIES.forEach((property) => {
      this.registerMetadata(property);
    });
  }

  registerMetadata(metadata: PropertyMetadata) {
    [metadata.name, ...(metadata.alias || [])].forEach((name) => {
      this.cache[name] = metadata;
    });
  }

  getMetadata(name: string) {
    return this.cache[name];
  }

  /**
   * * parse value, eg.
   * fill: 'red' => CSSRGB
   * translateX: '10px' => CSSUnitValue { unit: 'px', value: 10 }
   * fontSize: '2em' => { unit: 'px', value: 32 }
   *
   * * calculate used value
   * * post process
   */
  processProperties(
    object: DisplayObject,
    attributes: BaseStyleProps,
    options: { skipParse: boolean } = { skipParse: false },
  ) {
    const { skipParse } = options;

    let needUpdateGeometry = false;
    Object.keys(attributes).forEach((attributeName) => {
      const [name, value] = formatAttribute(attributeName, attributes[attributeName]);
      object.attributes[name] = value;
      if (!needUpdateGeometry && this.getMetadata(name as string)?.layoutDependent) {
        needUpdateGeometry = true;
      }
    });

    // parse according to priority
    const sortedNames = Object.keys(attributes).sort(
      (a, b) =>
        (this.getMetadata(a)?.parsePriority || 0) - (this.getMetadata(b)?.parsePriority || 0),
    );

    sortedNames.forEach((name) => {
      if (!skipParse) {
        object.computedStyle[name] = this.parseProperty(name as string, object.attributes[name]);
      }
    });

    let hasUnresolvedProperties = false;
    sortedNames.forEach((name) => {
      // some style props maybe deleted after parsing such as `anchor` in Text
      if (name in object.computedStyle) {
        hasUnresolvedProperties = this.computeProperty(
          name as string,
          object.computedStyle[name],
          object,
        );
      }
    });

    if (hasUnresolvedProperties) {
      this.dirty = true;
      return;
    }

    // update geometry
    if (needUpdateGeometry) {
      this.updateGeometry(object);
    }

    sortedNames.forEach((name) => {
      if (name in object.parsedStyle) {
        this.postProcessProperty(name as string, object);
      }
    });
  }

  /**
   * string -> parsed value
   */
  parseProperty(name: string, value: any): CSSStyleValue {
    const metadata = this.getMetadata(name);

    let computed: CSSStyleValue = value;

    if (value === 'unset' || value === 'initial' || value === 'inherit') {
      computed = new CSSKeywordValue(value);
    } else {
      if (metadata && metadata.handler) {
        const { keywords, handler } = metadata;

        // try to parse value with handler
        const propertyHandler = GlobalContainer.get(handler) as CSSProperty<any, any>;

        // use keywords
        if (keywords && keywords.indexOf(value) > -1) {
          computed = new CSSKeywordValue(value);
        } else if (propertyHandler && propertyHandler.parser) {
          // try to parse it to CSSStyleValue, eg. '10px' -> CSS.px(10)
          computed = propertyHandler.parser(value);
        }
      }
    }

    return computed;
  }

  /**
   * computed value -> used value
   */
  computeProperty(name: string, computed: CSSStyleValue, object: DisplayObject) {
    const metadata = this.getMetadata(name);

    let used: CSSStyleValue = computed instanceof CSSStyleValue ? computed.clone() : computed;

    if (metadata && metadata.handler) {
      const { handler, inherited, defaultValue } = metadata;

      if (computed instanceof CSSKeywordValue) {
        let value = computed.value;
        /**
         * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/unset
         */
        if (value === 'unset') {
          if (inherited) {
            value = 'inherit';
          } else {
            value = 'initial';
          }
        }

        if (value === 'initial') {
          // @see https://developer.mozilla.org/en-US/docs/Web/CSS/initial
          if (defaultValue) {
            computed = this.parseProperty(name, defaultValue);
          }
        } else if (value === 'inherit') {
          // @see https://developer.mozilla.org/en-US/docs/Web/CSS/inherit
          // behave like `inherit`
          const resolved = this.tryToResolveProperty(object, name, { inherited: true });
          if (resolved) {
            object.parsedStyle[name] = resolved;
            return false;
          } else {
            this.addUnresolveProperty(object, name);
            return true;
          }
        }
      }

      const propertyHandler = GlobalContainer.get(handler) as CSSProperty<any, any>;

      // convert computed value to used value
      if (propertyHandler && propertyHandler.calculator) {
        const oldParsedValue = object.parsedStyle[name];
        used = propertyHandler.calculator(name, oldParsedValue, computed, object, this);
      } else {
        used = computed;
      }
    }

    object.parsedStyle[name] = used;
    return false;
  }

  postProcessProperty(name: string, object: DisplayObject) {
    const metadata = this.getMetadata(name);

    if (metadata && metadata.handler) {
      const propertyHandler = GlobalContainer.get(metadata.handler) as CSSProperty<any, any>;

      if (propertyHandler && propertyHandler.postProcessor) {
        propertyHandler.postProcessor(object);
      }
    }
  }

  isPropertyResolved(object: DisplayObject, name: string) {
    if (
      !this.unresolvedProperties[object.entity] ||
      this.unresolvedProperties[object.entity].length === 0
    ) {
      return true;
    }

    return this.unresolvedProperties[object.entity].includes(name);
  }

  /**
   * resolve later
   */
  addUnresolveProperty(object: DisplayObject, name: string) {
    if (!this.unresolvedProperties[object.entity]) {
      this.unresolvedProperties[object.entity] = [];
    }

    if (this.unresolvedProperties[object.entity].indexOf(name) === -1) {
      this.unresolvedProperties[object.entity].push(name);
    }
  }

  tryToResolveProperty(object: DisplayObject, name: string, options: { inherited?: boolean } = {}) {
    const { inherited } = options;

    if (inherited) {
      if (object.parentElement) {
        return (
          this.isPropertyResolved(object.parentElement as DisplayObject, name) &&
          (object.parentElement as DisplayObject).parsedStyle[name]
        );
      }
    }

    return false;
  }

  recalc(object: DisplayObject) {
    const properties = this.unresolvedProperties[object.entity];
    if (properties && properties.length) {
      console.log('recalc', object);

      const attributes = {};
      properties.forEach((property) => {
        attributes[property] = object.attributes[property];
      });
      this.processProperties(object, attributes);
      delete this.unresolvedProperties[object.entity];
    }
  }

  // unregisterParentGeometryBoundsChangedHandler(child: DisplayObject, name: string) {
  //   const parent = child.parentElement as DisplayObject;

  //   if (parent) {
  //     if (this.boundsChangeListeners?.[parent.entity]?.[child.entity]) {
  //       const index = this.boundsChangeListeners[parent.entity][child.entity].indexOf(name);
  //       if (index > -1) {
  //         this.boundsChangeListeners[parent.entity][child.entity].splice(index, 1);

  //         // remove if no more listeners
  //         if (this.boundsChangeListeners[parent.entity][child.entity].length === 0) {
  //           delete this.boundsChangeListeners[parent.entity][child.entity];
  //         }
  //       }
  //     }
  //   }
  // }

  // registerParentGeometryBoundsChangedHandler(child: DisplayObject, name: string) {
  //   const parent = child.parentElement as DisplayObject;
  //   if (!this.boundsChangeListeners[parent.entity]) {
  //     this.boundsChangeListeners[parent.entity] = {};
  //     // clear all listeners when parent unmounted
  //     parent.addEventListener(ElementEvent.UNMOUNTED, () => {
  //       if (this.boundsChangeListeners?.[parent.entity]) {
  //         delete this.boundsChangeListeners[parent.entity];
  //       }
  //     });

  //     // trigger when parent's bounds changed
  //     parent.addEventListener(ElementEvent.GEOMETRY_BOUNDS_CHANGED, (e: FederatedEvent) => {
  //       // should inform listeners

  //       if (e.target !== parent) {
  //         return;
  //       }

  //       if (this.boundsChangeListeners[parent.entity]) {
  //         Object.keys(this.boundsChangeListeners[parent.entity]).forEach((entityStr) => {
  //           const childEntity = Number(entityStr);
  //           const properties = this.boundsChangeListeners[parent.entity][childEntity];
  //           // console.log('child informed...', childEntity, properties);

  //           const attributes = {};
  //           properties.forEach((property) => {
  //             attributes[property] = child.attributes[property];
  //           });

  //           // no need to generate computed value cause it's already parsed
  //           this.processProperties(child, attributes, { skipParse: true });
  //         });
  //       }
  //     });
  //   }

  //   // clear listeners when child unmounted
  //   if (!this.boundsChangeListeners[parent.entity][child.entity]) {
  //     child.addEventListener(ElementEvent.UNMOUNTED, () => {
  //       if (this.boundsChangeListeners?.[parent.entity]?.[child.entity]) {
  //         delete this.boundsChangeListeners[parent.entity][child.entity];
  //       }
  //     });
  //     this.boundsChangeListeners[parent.entity][child.entity] = [];
  //   }

  //   // add to property list
  //   if (this.boundsChangeListeners[parent.entity][child.entity].indexOf(name) === -1) {
  //     this.boundsChangeListeners[parent.entity][child.entity].push(name);
  //   }

  //   //
  //   this.processProperties(child, { [name]: child.attributes[name] }, { skipParse: true });
  // }

  // private computeInheritStyleProperty(child: DisplayObject, name: string): CSSStyleValue {
  //   let ascendant = child.parentElement;
  //   while (ascendant) {
  //     if (
  //       ascendant.getAttribute(name) !== 'inherit' &&
  //       ascendant.parsedStyle.hasOwnProperty(name)
  //     ) {
  //       return ascendant.parsedStyle[name];
  //     }
  //     ascendant = ascendant.parentElement;
  //   }

  //   return null;
  // }

  /**
   * update geometry when relative props changed,
   * eg. r of Circle, width/height of Rect
   */
  updateGeometry(object: DisplayObject) {
    const geometryUpdaterFactory =
      GlobalContainer.get<(tagName: string) => GeometryAABBUpdater<any>>(GeometryUpdaterFactory);
    const geometryUpdater = geometryUpdaterFactory(object.nodeName);
    if (geometryUpdater) {
      const geometry = object.geometry;
      if (!geometry.contentBounds) {
        geometry.contentBounds = new AABB();
      }
      if (!geometry.renderBounds) {
        geometry.renderBounds = new AABB();
      }

      const parsedStyle = object.parsedStyle as ParsedBaseStyleProps;

      const {
        width,
        height,
        depth = 0,
        x = 0,
        y = 0,
        // z = 0,
        offsetX = 0,
        offsetY = 0,
        offsetZ = 0,
      } = geometryUpdater.update(parsedStyle, object);

      if (
        object.nodeName === Shape.LINE ||
        object.nodeName === Shape.POLYLINE ||
        object.nodeName === Shape.POLYGON ||
        object.nodeName === Shape.PATH
      ) {
        parsedStyle.offsetX = x - (parsedStyle.defX || 0);
        parsedStyle.offsetY = y - (parsedStyle.defY || 0);
        parsedStyle.defX = x;
        parsedStyle.defY = y;

        // modify x/y/z
        object.attributes.x += parsedStyle.offsetX;
        object.attributes.y += parsedStyle.offsetY;
        parsedStyle.x = parsedStyle.x.add(
          new CSSUnitValue(parsedStyle.offsetX, 'px'),
        ) as CSSUnitValue;
        parsedStyle.y = parsedStyle.y.add(
          new CSSUnitValue(parsedStyle.offsetY, 'px'),
        ) as CSSUnitValue;
      }

      // init with content box
      const halfExtents = vec3.fromValues(width / 2, height / 2, depth / 2);
      // anchor is center by default, don't account for lineWidth here
      const { anchor, lineWidth, shadowColor, filter = [] } = parsedStyle as ParsedBaseStyleProps;

      // <Text> use textAlign & textBaseline instead of anchor
      if (object.nodeName === Shape.TEXT) {
        delete parsedStyle.anchor;
      }

      const center = vec3.fromValues(
        (1 - ((anchor && anchor[0].value) || 0) * 2) * halfExtents[0] + offsetX,
        (1 - ((anchor && anchor[1].value) || 0) * 2) * halfExtents[1] + offsetY,
        (1 - ((anchor && anchor[2]?.value) || 0) * 2) * halfExtents[2] + offsetZ,
      );

      // update geometry's AABB
      geometry.contentBounds.update(center, halfExtents);

      if (lineWidth) {
        // append border
        vec3.add(
          halfExtents,
          halfExtents,
          vec3.fromValues(lineWidth.value / 2, lineWidth.value / 2, 0),
        );
      }
      geometry.renderBounds.update(center, halfExtents);

      // account for shadow, only support constant value now
      if (shadowColor) {
        const { min, max } = geometry.renderBounds;

        const { shadowBlur, shadowOffsetX, shadowOffsetY } = parsedStyle as ParsedBaseStyleProps;
        const shadowBlurInPixels = (shadowBlur && shadowBlur.value) || 0;
        const shadowOffsetXInPixels = (shadowOffsetX && shadowOffsetX.value) || 0;
        const shadowOffsetYInPixels = (shadowOffsetY && shadowOffsetY.value) || 0;
        const shadowLeft = min[0] - shadowBlurInPixels + shadowOffsetXInPixels;
        const shadowRight = max[0] + shadowBlurInPixels + shadowOffsetXInPixels;
        const shadowTop = min[1] - shadowBlurInPixels + shadowOffsetYInPixels;
        const shadowBottom = max[1] + shadowBlurInPixels + shadowOffsetYInPixels;
        min[0] = Math.min(min[0], shadowLeft);
        max[0] = Math.max(max[0], shadowRight);
        min[1] = Math.min(min[1], shadowTop);
        max[1] = Math.max(max[1], shadowBottom);

        geometry.renderBounds.setMinMax(min, max);
      }

      // account for filter, eg. blur(5px), drop-shadow()
      (filter as ParsedFilterStyleProperty[]).forEach(({ name, params }) => {
        if (name === 'blur') {
          const blurRadius = params[0].value as number;
          geometry.renderBounds.update(
            geometry.renderBounds.center,
            vec3.add(
              geometry.renderBounds.halfExtents,
              geometry.renderBounds.halfExtents,
              vec3.fromValues(blurRadius, blurRadius, 0),
            ),
          );
        } else if (name === 'drop-shadow') {
          const shadowOffsetX = params[0].value;
          const shadowOffsetY = params[1].value;
          const shadowBlur = params[2].value;

          const { min, max } = geometry.renderBounds;
          const shadowLeft = min[0] - shadowBlur + shadowOffsetX;
          const shadowRight = max[0] + shadowBlur + shadowOffsetX;
          const shadowTop = min[1] - shadowBlur + shadowOffsetY;
          const shadowBottom = max[1] + shadowBlur + shadowOffsetY;
          min[0] = Math.min(min[0], shadowLeft);
          max[0] = Math.max(max[0], shadowRight);
          min[1] = Math.min(min[1], shadowTop);
          max[1] = Math.max(max[1], shadowBottom);

          geometry.renderBounds.setMinMax(min, max);
        }
      });

      object.emit(ElementEvent.GEOMETRY_BOUNDS_CHANGED, {});

      dirtifyToRoot(object);
    }
  }
}

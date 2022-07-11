import { vec3 } from 'gl-matrix';
import { GlobalContainer, inject, postConstruct, singleton } from 'mana-syringe';
import type { DisplayObject } from '../display-objects';
import { SceneGraphService } from '../services';
import type { GeometryAABBUpdater } from '../services/aabb/interfaces';
import { GeometryUpdaterFactory } from '../services/aabb/interfaces';
import { AABB } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { formatAttribute, isFunction, isNil } from '../utils';
import type { CSSRGB } from './cssom';
import { CSSKeywordValue, CSSStyleValue, CSSUnitValue } from './cssom';
import { CSSPropertySyntaxFactory } from './CSSProperty';
import type { PropertyMetadata } from './interfaces';
import { PropertySyntax, StyleValueRegistry } from './interfaces';
import type { ParsedFilterStyleProperty } from './parser';
import { convertPercentUnit } from './parser';

export type CSSGlobalKeywords = 'unset' | 'initial' | 'inherit' | '';
export interface PropertyParseOptions {
  skipUpdateAttribute: boolean;
  skipParse: boolean;
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
    /**
     * range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
     */
    name: 'opacity',
    interpolable: true,
    defaultValue: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * inheritable, range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-opacity
     * @see https://svgwg.org/svg2-draft/painting.html#FillOpacity
     */
    name: 'fillOpacity',
    interpolable: true,
    inherited: true,
    defaultValue: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * inheritable, range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-opacity
     * @see https://svgwg.org/svg2-draft/painting.html#StrokeOpacity
     */
    name: 'strokeOpacity',
    interpolable: true,
    inherited: true,
    defaultValue: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * background-color is not inheritable
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Fills_and_Strokes
     */
    name: 'fill',
    interpolable: true,
    keywords: ['none'],
    defaultValue: 'none',
    syntax: PropertySyntax.PAINT,
  },
  /**
   * default to none
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke#usage_notes
   */
  {
    name: 'stroke',
    interpolable: true,
    keywords: ['none'],
    defaultValue: 'none',
    syntax: PropertySyntax.PAINT,
  },
  {
    name: 'shadowType',
    keywords: ['inner', 'outer', 'both'],
    defaultValue: 'outer',
    layoutDependent: true,
  },
  {
    name: 'shadowColor',
    interpolable: true,
    syntax: PropertySyntax.COLOR,
  },
  {
    name: 'shadowOffsetX',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'shadowOffsetY',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'shadowBlur',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.SHADOW_BLUR,
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
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'increasedLineWidthForHitTesting',
    inherited: true,
    defaultValue: '0',
    layoutDependent: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'lineJoin',
    inherited: true,
    layoutDependent: true,
    alias: ['strokeLinejoin'],
    keywords: ['miter', 'bevel', 'round'],
    defaultValue: 'miter',
  },
  {
    name: 'lineCap',
    inherited: true,
    layoutDependent: true,
    alias: ['strokeLinecap'],
    keywords: ['butt', 'round', 'square'],
    defaultValue: 'butt',
  },
  {
    name: 'lineDash',
    interpolable: true,
    inherited: true,
    keywords: ['none'],
    alias: ['strokeDasharray'],
    syntax: PropertySyntax.LENGTH_PERCENTAGE_12,
  },
  {
    name: 'lineDashOffset',
    interpolable: true,
    inherited: true,
    defaultValue: '0',
    alias: ['strokeDashoffset'],
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'offsetPath',
    syntax: PropertySyntax.OFFSET_PATH,
  },
  {
    name: 'offsetDistance',
    interpolable: true,
    syntax: PropertySyntax.OFFSET_DISTANCE,
  },
  {
    name: 'dx',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'dy',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'zIndex',
    independent: true,
    interpolable: true,
    defaultValue: '0',
    keywords: ['auto'],
    syntax: PropertySyntax.Z_INDEX,
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
  },
  {
    name: 'pointerEvents',
    inherited: true,
    keywords: [
      'none',
      'auto',
      'stroke',
      'fill',
      'painted',
      'visible',
      'visiblestroke',
      'visiblefill',
      'visiblepainted',
      'bounding-box',
      'all',
    ],
    defaultValue: 'auto',
  },
  {
    name: 'filter',
    independent: true,
    layoutDependent: true,
    keywords: ['none'],
    defaultValue: 'none',
    syntax: PropertySyntax.FILTER,
  },
  {
    name: 'clipPath',
    syntax: PropertySyntax.CLIP_PATH,
  },
  {
    name: 'transform',
    parsePriority: 100,
    interpolable: true,
    keywords: ['none'],
    defaultValue: 'none',
    syntax: PropertySyntax.TRANSFORM,
  },
  {
    name: 'transformOrigin',
    parsePriority: 100,
    // interpolable: true,
    defaultValue: (nodeName: string) => {
      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        return 'center';
      }
      if (nodeName === Shape.TEXT) {
        return 'text-anchor';
      }
      return 'left top';
    },
    layoutDependent: true,
    syntax: PropertySyntax.TRANSFORM_ORIGIN,
  },
  {
    name: 'anchor',
    parsePriority: 99,
    defaultValue: (nodeName: string) => {
      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        return '0.5 0.5';
      }
      return '0 0';
    },
    layoutDependent: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE_12,
  },
  // <circle> & <ellipse>
  {
    name: 'cx',
    interpolable: true,
    defaultValue: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'cy',
    interpolable: true,
    defaultValue: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'r',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'rx',
    interpolable: true,
    layoutDependent: true,
    defaultValue: 'auto',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'ry',
    interpolable: true,
    layoutDependent: true,
    defaultValue: 'auto',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  // Rect Image Group
  {
    // x in local space
    name: 'x',
    interpolable: true,
    defaultValue: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // y in local space
    name: 'y',
    interpolable: true,
    defaultValue: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // z in local space
    name: 'z',
    interpolable: true,
    defaultValue: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'width',
    interpolable: true,
    layoutDependent: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/width
     */
    keywords: ['auto', 'fit-content', 'min-content', 'max-content'],
    defaultValue: 'auto',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'height',
    interpolable: true,
    layoutDependent: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/height
     */
    keywords: ['auto', 'fit-content', 'min-content', 'max-content'],
    defaultValue: 'auto',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    name: 'radius',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE_14,
  },
  // Line
  {
    name: 'x1',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'y1',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'z1',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'x2',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'y2',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    name: 'z2',
    interpolable: true,
    layoutDependent: true,
    syntax: PropertySyntax.COORDINATE,
  },
  // Path
  {
    name: 'path',
    interpolable: true,
    layoutDependent: true,
    defaultValue: '',
    alias: ['d'],
    syntax: PropertySyntax.PATH,
  },
  // Polyline & Polygon
  {
    name: 'points',
    layoutDependent: true,
    syntax: PropertySyntax.LIST_OF_POINTS,
  },
  // Text
  {
    name: 'text',
    layoutDependent: true,
    defaultValue: '',
    syntax: PropertySyntax.TEXT,
    parsePriority: 50,
  },
  {
    name: 'textTransform',
    layoutDependent: true,
    inherited: true,
    keywords: ['capitalize', 'uppercase', 'lowercase', 'none'],
    defaultValue: 'none',
    syntax: PropertySyntax.TEXT_TRANSFORM,
    parsePriority: 51, // it must get parsed after text
  },
  {
    name: 'font',
    layoutDependent: true,
  },
  {
    name: 'fontSize',
    interpolable: true,
    inherited: true,
    /**
     * @see https://www.w3schools.com/css/css_font_size.asp
     */
    defaultValue: '16px',
    layoutDependent: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
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
    keywords: ['normal', 'italic', 'oblique'],
    defaultValue: 'normal',
  },
  {
    name: 'fontWeight',
    layoutDependent: true,
    inherited: true,
    keywords: ['normal', 'bold', 'bolder', 'lighter'],
    defaultValue: 'normal',
  },
  {
    name: 'fontVariant',
    layoutDependent: true,
    inherited: true,
    keywords: ['normal', 'small-caps'],
    defaultValue: 'normal',
  },
  {
    name: 'lineHeight',
    layoutDependent: true,
    syntax: PropertySyntax.LENGTH,
    interpolable: true,
    defaultValue: '0',
  },
  {
    name: 'letterSpacing',
    layoutDependent: true,
    syntax: PropertySyntax.LENGTH,
    interpolable: true,
    defaultValue: '0',
  },
  {
    name: 'miterLimit',
    layoutDependent: true,
    syntax: PropertySyntax.NUMBER,
    defaultValue: (nodeName: string) => {
      if (nodeName === Shape.PATH || nodeName === Shape.POLYGON || nodeName === Shape.POLYLINE) {
        return '4';
      }
      return '10';
    },
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
    inherited: true,
    keywords: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'],
    defaultValue: 'alphabetic',
  },
  {
    name: 'textAlign',
    layoutDependent: true,
    inherited: true,
    keywords: ['start', 'center', 'end', 'left', 'right'],
    defaultValue: 'start',
  },
  {
    name: 'whiteSpace',
    layoutDependent: true,
  },
];

@singleton({
  token: StyleValueRegistry,
})
export class DefaultStyleValueRegistry implements StyleValueRegistry {
  /**
   * need recalc later
   */
  dirty = false;

  private cache: Record<string, PropertyMetadata> = {};

  private unresolvedProperties: Record<number, string[]> = {};

  @inject(CSSPropertySyntaxFactory)
  private propertySyntaxFactory: CSSPropertySyntaxFactory;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  /**
   * eg.
   *
   * document: {
   *   fontSize: [
   *
   *   ]
   * }
   */
  private cascadeProperties: Record<
    number,
    {
      property: string;
      listeners: number[];
    }
  > = {};

  // private boundsChangeListeners: Record<
  //   /**
  //    * parent's entity
  //    */
  //   number,
  //   Record<
  //     /**
  //      * child's entity
  //      */
  //     number,
  //     /**
  //      * child properties
  //      */
  //     string[]
  //   >
  // > = {};

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

  unregisterMetadata(name: string) {
    delete this.cache[name];
  }

  getMetadata(name: string) {
    return this.cache[name];
  }

  getPropertySyntax(syntax: string) {
    return this.propertySyntaxFactory<any, any>(syntax);
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
    options: Partial<PropertyParseOptions> = {
      skipUpdateAttribute: false,
      skipParse: false,
    },
  ) {
    const { skipUpdateAttribute, skipParse } = options;

    let needUpdateGeometry = false;
    Object.keys(attributes).forEach((attributeName) => {
      const [name, value] = formatAttribute(attributeName, attributes[attributeName]);

      if (!skipUpdateAttribute) {
        object.attributes[name] = value;
      }
      if (!needUpdateGeometry && this.getMetadata(name as string)?.layoutDependent) {
        needUpdateGeometry = true;
      }
    });

    // parse according to priority
    const sortedNames = Object.keys(attributes).sort(
      (a, b) =>
        (this.getMetadata(a)?.parsePriority || 0) - (this.getMetadata(b)?.parsePriority || 0),
    );

    if (!skipParse) {
      sortedNames.forEach((name) => {
        object.computedStyle[name] = this.parseProperty(
          name as string,
          object.attributes[name],
          object,
        );
      });
    }

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

    sortedNames.forEach((name) => {
      if (name in object.parsedStyle && this.isPropertyInheritable(name)) {
        // update children's inheritable
        object.children.forEach((child: DisplayObject) => {
          child.internalSetAttribute(name, null, {
            skipUpdateAttribute: true,
            skipParse: true,
          });
        });
      }
    });
  }

  /**
   * string -> parsed value
   */
  parseProperty(name: string, value: any, object: DisplayObject): CSSStyleValue {
    const metadata = this.getMetadata(name);

    let computed: CSSStyleValue = value;
    if (value === '' || isNil(value)) {
      value = 'unset';
    }

    if (value === 'unset' || value === 'initial' || value === 'inherit') {
      computed = new CSSKeywordValue(value);
    } else {
      if (metadata) {
        const { keywords, syntax } = metadata;
        const handler = syntax && this.getPropertySyntax(syntax);

        // use keywords
        if (keywords && keywords.indexOf(value) > -1) {
          computed = new CSSKeywordValue(value);
        } else if (handler) {
          // try to parse value with handler
          const propertyHandler = handler;

          if (propertyHandler && propertyHandler.parser) {
            // try to parse it to CSSStyleValue, eg. '10px' -> CSS.px(10)
            computed = propertyHandler.parser(value, object);
          }
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
    const isDocumentElement = object.id === 'g-root';

    let used: CSSStyleValue = computed instanceof CSSStyleValue ? computed.clone() : computed;

    if (metadata) {
      const { syntax, inherited, defaultValue } = metadata;

      if (computed instanceof CSSKeywordValue) {
        let value = computed.value;
        /**
         * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/unset
         */
        if (value === 'unset') {
          if (inherited && !isDocumentElement) {
            value = 'inherit';
          } else {
            value = 'initial';
          }
        }

        if (value === 'initial') {
          // @see https://developer.mozilla.org/en-US/docs/Web/CSS/initial
          if (!isNil(defaultValue)) {
            computed = this.parseProperty(
              name,
              isFunction(defaultValue) ? defaultValue(object.nodeName) : defaultValue,
              object,
            );
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

      const handler = syntax && this.getPropertySyntax(syntax);
      if (handler) {
        // convert computed value to used value
        if (handler.calculator) {
          const oldParsedValue = object.parsedStyle[name];
          used = handler.calculator(name, oldParsedValue, computed, object, this);
        } else {
          used = computed;
        }
      } else {
        used = computed;
      }
    }

    object.parsedStyle[name] = used;
    return false;
  }

  postProcessProperty(name: string, object: DisplayObject) {
    const metadata = this.getMetadata(name);

    if (metadata && metadata.syntax) {
      const handler = metadata.syntax && this.getPropertySyntax(metadata.syntax);
      const propertyHandler = handler;

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
      if (
        object.parentElement &&
        this.isPropertyResolved(object.parentElement as DisplayObject, name)
      ) {
        const usedValue = object.parentElement.parsedStyle[name];
        if (
          usedValue instanceof CSSKeywordValue &&
          (usedValue.value === 'unset' ||
            usedValue.value === 'initial' ||
            usedValue.value === 'inherit')
        ) {
          return false;
        } else if (
          usedValue instanceof CSSUnitValue &&
          CSSUnitValue.isRelativeUnit(usedValue.unit)
        ) {
          return false;
        }

        return usedValue;
      }
    }

    return false;
  }

  recalc(object: DisplayObject) {
    const properties = this.unresolvedProperties[object.entity];
    if (properties && properties.length) {
      const attributes = {};
      properties.forEach((property) => {
        attributes[property] = object.attributes[property];
      });

      this.processProperties(object, attributes);
      delete this.unresolvedProperties[object.entity];
    }
  }

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
        offsetX = 0,
        offsetY = 0,
        offsetZ = 0,
      } = geometryUpdater.update(parsedStyle, object);

      // account for negative width / height of Rect
      // @see https://github.com/antvis/g/issues/957
      const flipY = width < 0;
      const flipX = height < 0;

      // init with content box
      const halfExtents = vec3.fromValues(Math.abs(width) / 2, Math.abs(height) / 2, depth / 2);
      // anchor is center by default, don't account for lineWidth here
      const {
        stroke,
        lineWidth,
        // lineCap,
        // lineJoin,
        // miterLimit,
        increasedLineWidthForHitTesting,
        shadowType,
        shadowColor,
        filter = [],
        transformOrigin,
      } = parsedStyle as ParsedBaseStyleProps;
      let anchor = parsedStyle.anchor;

      // <Text> use textAlign & textBaseline instead of anchor
      if (object.nodeName === Shape.TEXT) {
        delete parsedStyle.anchor;
      }

      const center = vec3.fromValues(
        ((1 - ((anchor && anchor[0].value) || 0) * 2) * width) / 2 + offsetX,
        ((1 - ((anchor && anchor[1].value) || 0) * 2) * height) / 2 + offsetY,
        (1 - ((anchor && anchor[2]?.value) || 0) * 2) * halfExtents[2] + offsetZ,
      );

      // update geometry's AABB
      geometry.contentBounds.update(center, halfExtents);

      // @see https://github.molgen.mpg.de/git-mirror/cairo/blob/master/src/cairo-stroke-style.c#L97..L128
      const expansion =
        object.nodeName === Shape.POLYLINE ||
        object.nodeName === Shape.POLYGON ||
        object.nodeName === Shape.PATH
          ? Math.SQRT2
          : 0.5;
      // if (lineCap?.value === 'square') {
      //   expansion = Math.SQRT1_2;
      // }

      // if (lineJoin?.value === 'miter' && expansion < Math.SQRT2 * miterLimit) {
      //   expansion = Math.SQRT1_2 * miterLimit;
      // }

      // append border only if stroke existed
      const hasStroke = stroke && !(stroke as CSSRGB).isNone;
      if (hasStroke) {
        const halfLineWidth =
          ((lineWidth?.value || 0) + (increasedLineWidthForHitTesting?.value || 0)) * expansion;
        vec3.add(halfExtents, halfExtents, vec3.fromValues(halfLineWidth, halfLineWidth, 0));
      }
      geometry.renderBounds.update(center, halfExtents);

      // account for shadow, only support constant value now
      if (shadowColor && shadowType?.value !== 'inner') {
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

      anchor = parsedStyle.anchor;

      // set transform origin
      let usedOriginXValue = (flipY ? -1 : 1) * convertPercentUnit(transformOrigin[0], 0, object);
      let usedOriginYValue = (flipX ? -1 : 1) * convertPercentUnit(transformOrigin[1], 1, object);
      usedOriginXValue =
        usedOriginXValue -
        (flipY ? -1 : 1) *
          ((anchor && anchor[0].value) || 0) *
          geometry.contentBounds.halfExtents[0] *
          2;
      usedOriginYValue =
        usedOriginYValue -
        (flipX ? -1 : 1) *
          ((anchor && anchor[1].value) || 0) *
          geometry.contentBounds.halfExtents[1] *
          2;
      object.setOrigin(usedOriginXValue, usedOriginYValue);

      this.sceneGraphService.dirtifyToRoot(object);
    }
  }

  private isPropertyInheritable(name: string) {
    const metadata = this.getMetadata(name);
    if (!metadata) {
      return false;
    }

    return metadata.inherited;
  }
}

import { isNil, memoize } from '@antv/util';
import { vec3 } from 'gl-matrix';
import type { DisplayObject } from '../display-objects';
import { AABB } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { formatAttributeName, isFunction } from '../utils';
import type { CSSRGB, CSSStyleValue } from './cssom';
import { CSSKeywordValue } from './cssom';
import { getOrCreateKeyword } from './CSSStyleValuePool';
import type { PropertyMetadata, PropertyParseOptions, StyleValueRegistry } from './interfaces';
import { PropertySyntax } from './interfaces';
import type { ParsedFilterStyleProperty } from './parser';
import { convertPercentUnit } from './parser/dimension';
import { runtime } from '../global-runtime';

export type CSSGlobalKeywords = 'unset' | 'initial' | 'inherit' | '';

/**
 * Blink used them in code generation(css_properties.json5)
 */
export const BUILT_IN_PROPERTIES: PropertyMetadata[] = [
  {
    /**
     * used in CSS Layout API
     * eg. `display: 'flex'`
     */
    n: 'display',
    k: ['none'],
  },
  {
    /**
     * range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
     */
    n: 'opacity',
    int: true,
    inh: true,
    d: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * inheritable, range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-opacity
     * @see https://svgwg.org/svg2-draft/painting.html#FillOpacity
     */
    n: 'fillOpacity',
    int: true,
    inh: true,
    d: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * inheritable, range [0.0, 1.0]
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-opacity
     * @see https://svgwg.org/svg2-draft/painting.html#StrokeOpacity
     */
    n: 'strokeOpacity',
    int: true,
    inh: true,
    d: '1',
    syntax: PropertySyntax.OPACITY_VALUE,
  },
  {
    /**
     * background-color is not inheritable
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Fills_and_Strokes
     */
    n: 'fill',
    int: true,
    k: ['none'],
    d: 'none',
    syntax: PropertySyntax.PAINT,
  },
  {
    n: 'fillRule',
    k: ['nonzero', 'evenodd'],
    d: 'nonzero',
  },
  /**
   * default to none
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke#usage_notes
   */
  {
    n: 'stroke',
    int: true,
    k: ['none'],
    d: 'none',
    syntax: PropertySyntax.PAINT,
  },
  {
    n: 'shadowType',
    k: ['inner', 'outer', 'both'],
    d: 'outer',
    l: true,
  },
  {
    n: 'shadowColor',
    int: true,
    syntax: PropertySyntax.COLOR,
  },
  {
    n: 'shadowOffsetX',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'shadowOffsetY',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'shadowBlur',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.SHADOW_BLUR,
  },
  {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width
     */
    n: 'lineWidth',
    int: true,
    inh: true,
    d: '1',
    l: true,
    a: ['strokeWidth'],
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'increasedLineWidthForHitTesting',
    inh: true,
    d: '0',
    l: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'lineJoin',
    inh: true,
    l: true,
    a: ['strokeLinejoin'],
    k: ['miter', 'bevel', 'round'],
    d: 'miter',
  },
  {
    n: 'lineCap',
    inh: true,
    l: true,
    a: ['strokeLinecap'],
    k: ['butt', 'round', 'square'],
    d: 'butt',
  },
  {
    n: 'lineDash',
    int: true,
    inh: true,
    k: ['none'],
    a: ['strokeDasharray'],
    syntax: PropertySyntax.LENGTH_PERCENTAGE_12,
  },
  {
    n: 'lineDashOffset',
    int: true,
    inh: true,
    d: '0',
    a: ['strokeDashoffset'],
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'offsetPath',
    syntax: PropertySyntax.DEFINED_PATH,
  },
  {
    n: 'offsetDistance',
    int: true,
    syntax: PropertySyntax.OFFSET_DISTANCE,
  },
  {
    n: 'dx',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'dy',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'zIndex',
    ind: true,
    int: true,
    d: '0',
    k: ['auto'],
    syntax: PropertySyntax.Z_INDEX,
  },
  {
    n: 'visibility',
    k: ['visible', 'hidden'],
    ind: true,
    inh: true,
    /**
     * TODO: support interpolation
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#interpolation
     */
    // int: true,
    d: 'visible',
  },
  {
    n: 'pointerEvents',
    inh: true,
    k: [
      'none',
      'auto',
      'stroke',
      'fill',
      'painted',
      'visible',
      'visiblestroke',
      'visiblefill',
      'visiblepainted',
      // 'bounding-box',
      'all',
    ],
    d: 'auto',
  },
  {
    n: 'filter',
    ind: true,
    l: true,
    k: ['none'],
    d: 'none',
    syntax: PropertySyntax.FILTER,
  },
  {
    n: 'clipPath',
    syntax: PropertySyntax.DEFINED_PATH,
  },
  {
    n: 'textPath',
    syntax: PropertySyntax.DEFINED_PATH,
  },
  {
    n: 'textPathSide',
    k: ['left', 'right'],
    d: 'left',
  },
  {
    n: 'textPathStartOffset',
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'transform',
    p: 100,
    int: true,
    k: ['none'],
    d: 'none',
    syntax: PropertySyntax.TRANSFORM,
  },
  {
    n: 'transformOrigin',
    p: 100,
    // int: true,
    d: (nodeName: string) => {
      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        return 'center';
      }
      if (nodeName === Shape.TEXT) {
        return 'text-anchor';
      }
      return 'left top';
    },
    l: true,
    syntax: PropertySyntax.TRANSFORM_ORIGIN,
  },
  {
    n: 'anchor',
    p: 99,
    d: (nodeName: string) => {
      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        return '0.5 0.5';
      }
      return '0 0';
    },
    l: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE_12,
  },
  // <circle> & <ellipse>
  {
    n: 'cx',
    int: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'cy',
    int: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'r',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'rx',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'ry',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  // Rect Image Group
  {
    // x in local space
    n: 'x',
    int: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // y in local space
    n: 'y',
    int: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // z in local space
    n: 'z',
    int: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'width',
    int: true,
    l: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/width
     */
    k: ['auto', 'fit-content', 'min-content', 'max-content'],
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'height',
    int: true,
    l: true,
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/height
     */
    k: ['auto', 'fit-content', 'min-content', 'max-content'],
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'radius',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.LENGTH_PERCENTAGE_14,
  },
  // Line
  {
    n: 'x1',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'y1',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'z1',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'x2',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'y2',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'z2',
    int: true,
    l: true,
    syntax: PropertySyntax.COORDINATE,
  },
  // Path
  {
    n: 'path',
    int: true,
    l: true,
    d: '',
    a: ['d'],
    syntax: PropertySyntax.PATH,
    p: 50,
  },
  // Polyline & Polygon
  {
    n: 'points',
    l: true,
    syntax: PropertySyntax.LIST_OF_POINTS,
    p: 50,
  },
  // Text
  {
    n: 'text',
    l: true,
    d: '',
    syntax: PropertySyntax.TEXT,
    p: 50,
  },
  {
    n: 'textTransform',
    l: true,
    inh: true,
    k: ['capitalize', 'uppercase', 'lowercase', 'none'],
    d: 'none',
    syntax: PropertySyntax.TEXT_TRANSFORM,
    p: 51, // it must get parsed after text
  },
  {
    n: 'font',
    l: true,
  },
  {
    n: 'fontSize',
    int: true,
    inh: true,
    /**
     * @see https://www.w3schools.com/css/css_font_size.asp
     */
    d: '16px',
    l: true,
    syntax: PropertySyntax.LENGTH_PERCENTAGE,
  },
  {
    n: 'fontFamily',
    l: true,
    inh: true,
    d: 'sans-serif',
  },
  {
    n: 'fontStyle',
    l: true,
    inh: true,
    k: ['normal', 'italic', 'oblique'],
    d: 'normal',
  },
  {
    n: 'fontWeight',
    l: true,
    inh: true,
    k: ['normal', 'bold', 'bolder', 'lighter'],
    d: 'normal',
  },
  {
    n: 'fontVariant',
    l: true,
    inh: true,
    k: ['normal', 'small-caps'],
    d: 'normal',
  },
  {
    n: 'lineHeight',
    l: true,
    syntax: PropertySyntax.LENGTH,
    int: true,
    d: '0',
  },
  {
    n: 'letterSpacing',
    l: true,
    syntax: PropertySyntax.LENGTH,
    int: true,
    d: '0',
  },
  {
    n: 'miterLimit',
    l: true,
    syntax: PropertySyntax.NUMBER,
    d: (nodeName: string) => {
      if (nodeName === Shape.PATH || nodeName === Shape.POLYGON || nodeName === Shape.POLYLINE) {
        return '4';
      }
      return '10';
    },
  },
  {
    n: 'wordWrap',
    l: true,
  },
  {
    n: 'wordWrapWidth',
    l: true,
  },
  {
    n: 'maxLines',
    l: true,
  },
  {
    n: 'textOverflow',
    l: true,
    d: 'clip',
  },
  {
    n: 'leading',
    l: true,
  },
  {
    n: 'textBaseline',
    l: true,
    inh: true,
    k: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'],
    d: 'alphabetic',
  },
  {
    n: 'textAlign',
    l: true,
    inh: true,
    k: ['start', 'center', 'middle', 'end', 'left', 'right'],
    d: 'start',
  },
  // {
  //   n: 'whiteSpace',
  //   l: true,
  // },
  {
    n: 'markerStart',
    syntax: PropertySyntax.MARKER,
  },
  {
    n: 'markerEnd',
    syntax: PropertySyntax.MARKER,
  },
  {
    n: 'markerMid',
    syntax: PropertySyntax.MARKER,
  },
  {
    n: 'markerStartOffset',
    syntax: PropertySyntax.LENGTH,
    l: true,
    int: true,
    d: '0',
  },
  {
    n: 'markerEndOffset',
    syntax: PropertySyntax.LENGTH,
    l: true,
    int: true,
    d: '0',
  },
];

export const propertyMetadataCache: Record<string, PropertyMetadata> = {};
const unresolvedProperties: WeakMap<DisplayObject, string[]> = new WeakMap();
const priorityMap: Record<string, number> = {};
const sortAttributeNames = memoize((attributeNames: string[]) => {
  return attributeNames.sort((a, b) => priorityMap[a] - priorityMap[b]);
});

const tmpVec3a = vec3.create();
const tmpVec3b = vec3.create();
const tmpVec3c = vec3.create();

const isPropertyResolved = (object: DisplayObject, name: string) => {
  const properties = unresolvedProperties.get(object);
  if (!properties || properties.length === 0) {
    return true;
  }

  return properties.includes(name);
};

export class DefaultStyleValueRegistry implements StyleValueRegistry {
  /**
   * need recalc later
   */
  // dirty = false;

  constructor() {
    BUILT_IN_PROPERTIES.forEach((property) => {
      this.registerMetadata(property);
    });
  }

  registerMetadata(metadata: PropertyMetadata) {
    [metadata.n, ...(metadata.a || [])].forEach((name) => {
      propertyMetadataCache[name] = metadata;
      priorityMap[name] = metadata.p || 0;
    });
  }

  unregisterMetadata(name: string) {
    delete propertyMetadataCache[name];
  }

  getPropertySyntax(syntax: string) {
    return runtime.CSSPropertySyntaxFactory[syntax];
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
      forceUpdateGeometry: false,
      usedAttributes: [],
    },
  ) {
    const { skipUpdateAttribute, skipParse, forceUpdateGeometry, usedAttributes } = options;

    let needUpdateGeometry = forceUpdateGeometry;
    let attributeNames = Object.keys(attributes);

    attributeNames.forEach((attributeName) => {
      const name = formatAttributeName(attributeName);

      if (!skipUpdateAttribute) {
        object.attributes[name] = attributes[attributeName];
      }

      if (!needUpdateGeometry && propertyMetadataCache[name as string]?.l) {
        needUpdateGeometry = true;
      }
    });

    if (!skipParse) {
      attributeNames.forEach((name) => {
        object.computedStyle[name] = this.parseProperty(
          name as string,
          object.attributes[name],
          object,
        );
      });
    }

    // let hasUnresolvedProperties = false;

    // parse according to priority
    attributeNames = sortAttributeNames(
      usedAttributes?.length
        ? Array.from(new Set(attributeNames.concat(usedAttributes)))
        : attributeNames,
    );
    // attributeNames.sort((a, b) => priorityMap[a] - priorityMap[b]);

    attributeNames.forEach((name) => {
      // some style props maybe deleted after parsing such as `anchor` in Text
      if (name in object.computedStyle) {
        object.parsedStyle[name] = this.computeProperty(
          name as string,
          object.computedStyle[name],
          object,
        );
      }
    });

    // if (hasUnresolvedProperties) {
    //   this.dirty = true;
    //   return;
    // }

    // update geometry
    if (needUpdateGeometry) {
      this.updateGeometry(object);
    }

    attributeNames.forEach((name) => {
      if (name in object.parsedStyle) {
        this.postProcessProperty(name as string, object);
      }
    });

    if (object.children.length) {
      attributeNames.forEach((name) => {
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
  }

  /**
   * string -> parsed value
   */
  parseProperty(name: string, value: any, object: DisplayObject): CSSStyleValue {
    const metadata = propertyMetadataCache[name];

    let computed: CSSStyleValue = value;
    if (value === '' || isNil(value)) {
      value = 'unset';
    }

    if (value === 'unset' || value === 'initial' || value === 'inherit') {
      // computed = new CSSKeywordValue(value);
      computed = getOrCreateKeyword(value);
    } else {
      if (metadata) {
        const { k: keywords, syntax } = metadata;
        const handler = syntax && this.getPropertySyntax(syntax);

        // use keywords
        if (keywords && keywords.indexOf(value) > -1) {
          // computed = new CSSKeywordValue(value);
          computed = getOrCreateKeyword(value);
        } else if (handler && handler.parser) {
          // try to parse it to CSSStyleValue, eg. '10px' -> CSS.px(10)
          computed = handler.parser(value, object);
        }
      }
    }

    return computed;
  }

  /**
   * computed value -> used value
   */
  computeProperty(name: string, computed: CSSStyleValue, object: DisplayObject) {
    const metadata = propertyMetadataCache[name];
    const isDocumentElement = object.id === 'g-root';

    // let used: CSSStyleValue = computed instanceof CSSStyleValue ? computed.clone() : computed;
    let used: any = computed;

    if (metadata) {
      const { syntax, inh: inherited, d: defaultValue } = metadata;
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
          if (!isNil(resolved)) {
            // object.parsedStyle[name] = resolved;
            // return false;
            return resolved;
          } else {
            this.addUnresolveProperty(object, name);
            return;
          }
        }
      }

      const handler = syntax && this.getPropertySyntax(syntax);
      if (handler && handler.calculator) {
        // convert computed value to used value
        const oldParsedValue = object.parsedStyle[name];
        used = handler.calculator(name, oldParsedValue, computed, object, this);
      } else if (computed instanceof CSSKeywordValue) {
        used = computed.value;
      } else {
        used = computed;
      }
    }

    // object.parsedStyle[name] = used;
    // return false;
    return used;
  }

  postProcessProperty(name: string, object: DisplayObject) {
    const metadata = propertyMetadataCache[name];

    if (metadata && metadata.syntax) {
      const handler = metadata.syntax && this.getPropertySyntax(metadata.syntax);
      const propertyHandler = handler;

      if (propertyHandler && propertyHandler.postProcessor) {
        propertyHandler.postProcessor(object);
      }
    }
  }

  /**
   * resolve later
   */
  addUnresolveProperty(object: DisplayObject, name: string) {
    let properties = unresolvedProperties.get(object);
    if (!properties) {
      unresolvedProperties.set(object, []);
      properties = unresolvedProperties.get(object);
    }

    if (properties.indexOf(name) === -1) {
      properties.push(name);
    }
  }

  tryToResolveProperty(object: DisplayObject, name: string, options: { inherited?: boolean } = {}) {
    const { inherited } = options;

    if (inherited) {
      if (object.parentElement && isPropertyResolved(object.parentElement as DisplayObject, name)) {
        // const computedValue = object.parentElement.computedStyle[name];
        const usedValue = object.parentElement.parsedStyle[name];
        if (
          // usedValue instanceof CSSKeywordValue &&
          usedValue === 'unset' ||
          usedValue === 'initial' ||
          usedValue === 'inherit'
        ) {
          return;
        }

        // else if (
        //   usedValue instanceof CSSUnitValue &&
        //   CSSUnitValue.isRelativeUnit(usedValue.unit)
        // ) {
        //   return false;
        // }

        return usedValue;
      }
    }

    return;
  }

  recalc(object: DisplayObject) {
    const properties = unresolvedProperties.get(object);
    if (properties && properties.length) {
      const attributes = {};
      properties.forEach((property) => {
        attributes[property] = object.attributes[property];
      });

      this.processProperties(object, attributes);
      unresolvedProperties.delete(object);
    }
  }

  /**
   * update geometry when relative props changed,
   * eg. r of Circle, width/height of Rect
   */
  private updateGeometry(object: DisplayObject) {
    const geometryUpdater = runtime.geometryUpdaterFactory[object.nodeName];
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
      const halfExtents = vec3.set(tmpVec3a, Math.abs(width) / 2, Math.abs(height) / 2, depth / 2);

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

      const center = vec3.set(
        tmpVec3b,
        ((1 - ((anchor && anchor[0]) || 0) * 2) * width) / 2 + offsetX,
        ((1 - ((anchor && anchor[1]) || 0) * 2) * height) / 2 + offsetY,
        (1 - ((anchor && anchor[2]) || 0) * 2) * halfExtents[2] + offsetZ,
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
          ((lineWidth || 0) + (increasedLineWidthForHitTesting || 0)) * expansion;
        // halfExtents[0] += halfLineWidth[0];
        // halfExtents[1] += halfLineWidth[1];

        vec3.add(halfExtents, halfExtents, vec3.set(tmpVec3c, halfLineWidth, halfLineWidth, 0));
      }
      geometry.renderBounds.update(center, halfExtents);

      // account for shadow, only support constant value now
      if (shadowColor && shadowType && shadowType !== 'inner') {
        const { min, max } = geometry.renderBounds;

        const { shadowBlur, shadowOffsetX, shadowOffsetY } = parsedStyle as ParsedBaseStyleProps;
        const shadowBlurInPixels = shadowBlur || 0;
        const shadowOffsetXInPixels = shadowOffsetX || 0;
        const shadowOffsetYInPixels = shadowOffsetY || 0;
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
        (flipY ? -1 : 1) * ((anchor && anchor[0]) || 0) * geometry.contentBounds.halfExtents[0] * 2;
      usedOriginYValue =
        usedOriginYValue -
        (flipX ? -1 : 1) * ((anchor && anchor[1]) || 0) * geometry.contentBounds.halfExtents[1] * 2;
      object.setOrigin(usedOriginXValue, usedOriginYValue);

      runtime.sceneGraphService.dirtifyToRoot(object);
    }
  }

  private isPropertyInheritable(name: string) {
    const metadata = propertyMetadataCache[name];
    if (!metadata) {
      return false;
    }

    return metadata.inh;
  }
}

import { isNil, isUndefined } from '@antv/util';
import { vec3 } from 'gl-matrix';
import type { DisplayObject } from '../display-objects';
import { EMPTY_PARSED_PATH } from '../display-objects/constants';
import { runtime, type GlobalRuntime } from '../global-runtime';
import { GeometryAABBUpdater } from '../services';
import { AABB } from '../shapes';
import type { BaseStyleProps, Tuple3Number } from '../types';
import { Shape } from '../types';
import type { CSSRGB } from './cssom';
import type {
  PropertyMetadata,
  PropertyParseOptions,
  StyleValueRegistry,
} from './interfaces';
import { PropertySyntax } from './interfaces';
import {
  parseColor,
  parseFilter,
  parsePath,
  parsePoints,
  parseTransform,
  parseTransformOrigin,
} from './parser';
import {
  convertPercentUnit,
  parseDimensionArrayFormat,
} from './parser/dimension';

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
    /**
     * Stroke 'none' won't affect geometry but others will.
     */
    l: true,
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
     * support interpolation
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#interpolation
     */
    int: true,
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
    d: '0 0',
    // // int: true,
    // d: (nodeName: string) => {
    //   if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
    //     return 'center';
    //   }
    //   if (nodeName === Shape.TEXT) {
    //     return 'text-anchor';
    //   }
    //   return 'left top';
    // },
    l: true,
    syntax: PropertySyntax.TRANSFORM_ORIGIN,
  },
  {
    n: 'cx',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'cy',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    n: 'cz',
    int: true,
    l: true,
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
    l: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // y in local space
    n: 'y',
    int: true,
    l: true,
    d: '0',
    syntax: PropertySyntax.COORDINATE,
  },
  {
    // z in local space
    n: 'z',
    int: true,
    l: true,
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
    n: 'd',
    int: true,
    l: true,
    d: '',
    syntax: PropertySyntax.PATH,
    p: 50,
  },
  // Polyline & Polygon
  {
    n: 'points',
    /**
     * support interpolation
     */
    int: true,
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
      if (
        nodeName === Shape.PATH ||
        nodeName === Shape.POLYGON ||
        nodeName === Shape.POLYLINE
      ) {
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

const GEOMETRY_ATTRIBUTE_NAMES = new Set(
  BUILT_IN_PROPERTIES.filter((n) => !!n.l).map((n) => n.n),
);

export const propertyMetadataCache: Record<string, PropertyMetadata> = {};

export class DefaultStyleValueRegistry implements StyleValueRegistry {
  constructor(private runtime: GlobalRuntime) {
    BUILT_IN_PROPERTIES.forEach((property) => {
      this.registerMetadata(property);
    });
  }

  registerMetadata(metadata: PropertyMetadata) {
    [metadata.n, ...(metadata.a || [])].forEach((name) => {
      propertyMetadataCache[name] = metadata;
    });
  }

  getPropertySyntax(syntax: string) {
    return this.runtime.CSSPropertySyntaxFactory[syntax];
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
      memoize: true,
    },
  ) {
    Object.assign(object.attributes, attributes);

    // clipPath
    const oldClipPath = object.parsedStyle.clipPath;
    const oldOffsetPath = object.parsedStyle.offsetPath;

    assignParsedStyle(object, attributes);

    let needUpdateGeometry = !!options.forceUpdateGeometry;
    if (!needUpdateGeometry) {
      for (const i in attributes) {
        if (GEOMETRY_ATTRIBUTE_NAMES.has(i)) {
          needUpdateGeometry = true;
          break;
        }
      }
    }

    if (attributes.fill) {
      object.parsedStyle.fill = parseColor(attributes.fill);
    }
    if (attributes.stroke) {
      object.parsedStyle.stroke = parseColor(attributes.stroke);
    }
    if (attributes.shadowColor) {
      object.parsedStyle.shadowColor = parseColor(attributes.shadowColor);
    }
    if (attributes.filter) {
      object.parsedStyle.filter = parseFilter(attributes.filter);
    }
    // Rect
    // @ts-ignore
    if (!isNil(attributes.radius)) {
      // @ts-ignore
      object.parsedStyle.radius = parseDimensionArrayFormat(
        // @ts-ignore
        attributes.radius,
        4,
      );
    }
    // Polyline
    if (!isNil(attributes.lineDash)) {
      object.parsedStyle.lineDash = parseDimensionArrayFormat(
        attributes.lineDash,
        2,
      );
    }
    // @ts-ignore
    if (attributes.points) {
      // @ts-ignore
      object.parsedStyle.points = parsePoints(attributes.points, object);
    }
    // Path
    // @ts-ignore
    if (attributes.d === '') {
      object.parsedStyle.d = {
        ...EMPTY_PARSED_PATH,
      };
    }
    // @ts-ignore
    if (attributes.d) {
      object.parsedStyle.d = parsePath(
        // @ts-ignore
        attributes.d,
      );
    }
    // Text
    if (attributes.textTransform) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.TEXT_TRANSFORM
      ].calculator(
        null,
        null,
        { value: attributes.textTransform },
        object,
        null,
      );
    }
    if (!isUndefined(attributes.clipPath)) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.DEFINED_PATH
      ].calculator(
        'clipPath',
        oldClipPath,
        attributes.clipPath,
        object,
        this.runtime,
      );
    }
    if (attributes.offsetPath) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.DEFINED_PATH
      ].calculator(
        'offsetPath',
        oldOffsetPath,
        attributes.offsetPath,
        object,
        this.runtime,
      );
    }
    if (attributes.transform) {
      object.parsedStyle.transform = parseTransform(attributes.transform);
    }
    if (attributes.transformOrigin) {
      object.parsedStyle.transformOrigin = parseTransformOrigin(
        attributes.transformOrigin,
      );
    }
    // Marker
    // @ts-ignore
    if (attributes.markerStart) {
      object.parsedStyle.markerStart = this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.MARKER
      ].calculator(
        null,
        // @ts-ignore
        attributes.markerStart,
        // @ts-ignore
        attributes.markerStart,
        null,
        null,
      );
    }
    // @ts-ignore
    if (attributes.markerEnd) {
      object.parsedStyle.markerEnd = this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.MARKER
      ].calculator(
        null,
        // @ts-ignore
        attributes.markerEnd,
        // @ts-ignore
        attributes.markerEnd,
        null,
        null,
      );
    }
    // @ts-ignore
    if (attributes.markerMid) {
      object.parsedStyle.markerMid = this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.MARKER
      ].calculator(
        '',
        // @ts-ignore
        attributes.markerMid,
        // @ts-ignore
        attributes.markerMid,
        null,
        null,
      );
    }

    if (!isNil(attributes.zIndex)) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.Z_INDEX
      ].postProcessor(object);
    }
    if (!isNil(attributes.offsetDistance)) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.OFFSET_DISTANCE
      ].postProcessor(object);
    }
    if (attributes.transform) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.TRANSFORM
      ].postProcessor(object);
    }
    if (attributes.transformOrigin) {
      this.runtime.CSSPropertySyntaxFactory[
        PropertySyntax.TRANSFORM_ORIGIN
      ].postProcessor(object);
    }

    if (needUpdateGeometry) {
      object.geometry.dirty = true;
      object.renderable.boundsDirty = true;
      object.renderable.renderBoundsDirty = true;

      if (!options.forceUpdateGeometry) {
        this.runtime.sceneGraphService.dirtifyToRoot(object);
      }
    }
  }

  /**
   * update geometry when relative props changed,
   * eg. r of Circle, width/height of Rect
   */
  updateGeometry(object: DisplayObject) {
    const { nodeName } = object;
    const geometryUpdater = this.runtime.geometryUpdaterFactory[
      nodeName
    ] as GeometryAABBUpdater;
    if (geometryUpdater) {
      const { geometry } = object;
      if (!geometry.contentBounds) {
        geometry.contentBounds = new AABB();
      }
      if (!geometry.renderBounds) {
        geometry.renderBounds = new AABB();
      }
      const parsedStyle = object.parsedStyle;
      const {
        cx = 0,
        cy = 0,
        cz = 0,
        hwidth = 0,
        hheight = 0,
        hdepth = 0,
      } = geometryUpdater.update(parsedStyle, object);
      // init with content box
      const halfExtents: Tuple3Number = [
        Math.abs(hwidth),
        Math.abs(hheight),
        hdepth,
      ];
      // anchor is center by default, don't account for lineWidth here
      const {
        stroke,
        lineWidth = 1,
        // lineCap,
        // lineJoin,
        // miterLimit,
        increasedLineWidthForHitTesting = 0,
        shadowType = 'outer',
        shadowColor,
        filter = [],
        transformOrigin,
      } = parsedStyle;
      const center: Tuple3Number = [cx, cy, cz];
      // update geometry's AABB
      geometry.contentBounds.update(center, halfExtents);
      // @see https://github.molgen.mpg.de/git-mirror/cairo/blob/master/src/cairo-stroke-style.c#L97..L128
      const expansion =
        nodeName === Shape.POLYLINE ||
        nodeName === Shape.POLYGON ||
        nodeName === Shape.PATH
          ? Math.SQRT2
          : 0.5;
      // append border only if stroke existed
      const hasStroke = stroke && !(stroke as CSSRGB).isNone;
      if (hasStroke) {
        const halfLineWidth =
          ((lineWidth || 0) + (increasedLineWidthForHitTesting || 0)) *
          expansion;
        halfExtents[0] += halfLineWidth;
        halfExtents[1] += halfLineWidth;
      }
      geometry.renderBounds.update(center, halfExtents);
      // account for shadow, only support constant value now
      if (shadowColor && shadowType && shadowType !== 'inner') {
        const { min, max } = geometry.renderBounds;
        const { shadowBlur, shadowOffsetX, shadowOffsetY } = parsedStyle;
        const shadowBlurInPixels = shadowBlur || 0;
        const shadowOffsetXInPixels = shadowOffsetX || 0;
        const shadowOffsetYInPixels = shadowOffsetY || 0;
        const shadowLeft = min[0] - shadowBlurInPixels + shadowOffsetXInPixels;
        const shadowRight = max[0] + shadowBlurInPixels + shadowOffsetXInPixels;
        const shadowTop = min[1] - shadowBlurInPixels + shadowOffsetYInPixels;
        const shadowBottom =
          max[1] + shadowBlurInPixels + shadowOffsetYInPixels;
        min[0] = Math.min(min[0], shadowLeft);
        max[0] = Math.max(max[0], shadowRight);
        min[1] = Math.min(min[1], shadowTop);
        max[1] = Math.max(max[1], shadowBottom);
        geometry.renderBounds.setMinMax(min, max);
      }
      // account for filter, eg. blur(5px), drop-shadow()
      filter.forEach(({ name, params }) => {
        if (name === 'blur') {
          const blurRadius = params[0].value;
          geometry.renderBounds.update(
            geometry.renderBounds.center,
            vec3.add(
              geometry.renderBounds.halfExtents,
              geometry.renderBounds.halfExtents,
              [blurRadius, blurRadius, 0],
            ) as Tuple3Number,
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

      object.geometry.dirty = false;

      // @see https://github.com/antvis/g/issues/957
      const flipY = hwidth < 0;
      const flipX = hheight < 0;
      // set transform origin
      const usedOriginXValue =
        (flipY ? -1 : 1) *
        (transformOrigin
          ? convertPercentUnit(transformOrigin[0], 0, object, true)
          : 0);
      const usedOriginYValue =
        (flipX ? -1 : 1) *
        (transformOrigin
          ? convertPercentUnit(transformOrigin[1], 1, object, true)
          : 0);

      if (usedOriginXValue || usedOriginYValue) {
        object.setOrigin(usedOriginXValue, usedOriginYValue);
      }
    }
  }

  updateSizeAttenuation(node: DisplayObject, zoom: number) {
    if (node.style.isSizeAttenuation) {
      if (!node.style.rawLineWidth) {
        node.style.rawLineWidth = node.style.lineWidth;
      }
      node.style.lineWidth = (node.style.rawLineWidth || 1) / zoom;

      if (node.nodeName === Shape.CIRCLE) {
        if (!node.style.rawR) {
          node.style.rawR = node.style.r;
        }
        node.style.r = (node.style.rawR || 1) / zoom;
      }
    } else {
      if (node.style.rawLineWidth) {
        node.style.lineWidth = node.style.rawLineWidth;
        delete node.style.rawLineWidth;
      }
      if (node.nodeName === Shape.CIRCLE) {
        if (node.style.rawR) {
          node.style.r = node.style.rawR;
          delete node.style.rawR;
        }
      }
    }
  }
}

function assignParsedStyle(
  object: DisplayObject,
  attributes: Record<string, any>,
) {
  if (!runtime.enableMassiveParsedStyleAssignOptimization) {
    Object.assign(object.parsedStyle, attributes);
    return;
  }

  const list = (object.constructor as typeof DisplayObject).PARSED_STYLE_LIST;
  for (const key in attributes) {
    if (list.has(key)) {
      object.parsedStyle[key] = attributes[key];
    }
  }
}

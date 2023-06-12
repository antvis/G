import type { vec2, vec3 } from 'gl-matrix';
import type { IRenderer } from './AbstractRenderer';
import type {
  CSSGlobalKeywords,
  CSSGradientValue,
  CSSRGB,
  CSSUnitValue,
} from './css';
import type {
  ParsedFilterStyleProperty,
  ParsedTransform,
  Pattern,
} from './css/parser';
import type { DisplayObject } from './display-objects';

export enum Shape {
  GROUP = 'g',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  IMAGE = 'image',
  RECT = 'rect',
  LINE = 'line',
  POLYLINE = 'polyline',
  POLYGON = 'polygon',
  TEXT = 'text',
  PATH = 'path',
  HTML = 'html',
  MESH = 'mesh',
}

type ColorType = string | null;

export interface EventPosition {
  clientX: number;
  clientY: number;
  viewportX: number;
  viewportY: number;
  x: number;
  y: number;
}

export type TextTransform = 'capitalize' | 'uppercase' | 'lowercase' | 'none';
export type TextOverflow = 'clip' | 'ellipsis' | string;
export type TextDecorationLine = string | 'none';
export type TextDecorationStyle =
  | 'solid'
  | 'double'
  | 'dotted'
  | 'dashed'
  | 'wavy';

export interface BaseStyleProps {
  class?: string;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform
   */
  transform?: string;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
   */
  transformOrigin?: string;

  /**
   * how do we define the 'position' of a shape?
   * eg. the default anchor of a Rect is top-left, we can change it to its' center [0.5, 0.5].
   */
  anchor?: vec2 | vec3 | string;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  visibility?: 'visible' | 'hidden' | CSSGlobalKeywords;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/pointer-events
   */
  pointerEvents?:
    | 'none'
    | 'auto'
    | 'stroke'
    | 'fill'
    | 'painted'
    | 'visible'
    | 'visiblestroke'
    | 'visiblefill'
    | 'visiblepainted'
    // | 'bounding-box'
    | 'all'
    | CSSGlobalKeywords;

  /**
   * z-index in CSS
   */
  zIndex?: number;

  /**
   * the cursor style when the target is active
   */
  cursor?: Cursor;

  /**
   * clip path
   * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path
   */
  clipPath?: DisplayObject | null;

  /**
   * offset path
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path
   */
  offsetPath?: DisplayObject | null;
  offsetDistance?: number;

  stroke?: ColorType | Pattern;
  /** 描边透明度 */
  strokeOpacity?: number | string;
  /** 填充颜色 */
  fill?: ColorType | Pattern;
  /** 填充透明度 */
  fillOpacity?: number | string;

  /**
   * The fill-rule attribute is a presentation attribute defining the algorithm to use to determine the inside part of a shape.
   * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-rule
   */
  fillRule?: 'nonzero' | 'evenodd';

  /** 整体透明度 */
  opacity?: number | string;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width
   */
  strokeWidth?: string | number;

  /**
   * alias if strokeWidth
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth
   */
  lineWidth?: string | number;

  /**
   * increased line width when hitting test
   */
  increasedLineWidthForHitTesting?: string | number;
  /**
   * 交互区域
   */
  hitArea?: DisplayObject | null;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap
   */
  strokeLinecap?: CanvasLineCap;

  /**
   * alias of strokeLinecap
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
   */
  lineCap?: CanvasLineCap;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
   */
  strokeLinejoin?: CanvasLineJoin;

  /**
   * alias of strokeLinejoin
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
   */
  lineJoin?: CanvasLineJoin;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   */
  strokeDasharray?: string | (string | number)[];

  /**
   * alias of strokeDasharray
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getLineDash
   */
  lineDash?: number | string | (string | number)[];

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset
   */
  strokeDashoffset?: number;

  /**
   * alias of strokeDashoffset
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
   */
  lineDashOffset?: number;

  shadowType?: 'inner' | 'outer' | 'both';
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
   */
  shadowBlur?: number;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor
   */
  shadowColor?: ColorType;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX
   */
  shadowOffsetX?: number;

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY
   */
  shadowOffsetY?: number;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/filter
   */
  filter?: string;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform
   */
  textTransform?: TextTransform | '';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit
   */
  miterLimit?: number | string;

  display?: string;

  /**
   * @see https://g-next.antv.vision/zh/docs/plugins/dragndrop#drag
   */
  draggable?: boolean;

  /**
   * @see https://g-next.antv.vision/zh/docs/plugins/dragndrop#drop
   */
  droppable?: boolean;
}

export interface ParsedBaseStyleProps
  extends Omit<
    BaseStyleProps,
    | 'anchor'
    | 'fill'
    | 'stroke'
    | 'lineWidth'
    | 'increasedLineWidthForHitTesting'
    | 'lineDash'
    | 'path'
    | 'points'
    | 'shadowColor'
    | 'transform'
    | 'transformOrigin'
    | 'miterLimit'
    | 'filter'
    | 'opacity'
    | 'fillOpacity'
    | 'strokeOpacity'
  > {
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;

  fill?: CSSRGB | CSSGradientValue[] | Pattern;
  stroke?: CSSRGB | CSSGradientValue[] | Pattern;
  lineDash?: [number, number];

  anchor?: [number, number, number];
  transform: ParsedTransform[];
  transformOrigin?: [CSSUnitValue, CSSUnitValue, CSSUnitValue];

  lineWidth?: number;
  increasedLineWidthForHitTesting?: number;
  /**
   * x according to definition, eg. Line's x1/x2, Polyline's points
   */
  defX?: number;
  defY?: number;
  /**
   * offset relative to initial definition
   */
  offsetX?: number;
  offsetY?: number;
  shadowColor?: CSSRGB;
  miterLimit?: number;
  filter?: ParsedFilterStyleProperty[];
}

// Cursor style
// See: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
export type Cursor =
  | 'auto'
  | 'default'
  | 'none'
  | 'context-menu'
  | 'help'
  | 'pointer'
  | 'progress'
  | 'wait'
  | 'cell'
  | 'crosshair'
  | 'text'
  | 'vertical-text'
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'grab'
  | 'grabbing'
  | 'all-scroll'
  | 'col-resize'
  | 'row-resize'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'ew-resize'
  | 'ns-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'zoom-in'
  | 'zoom-out';

export interface RendererConfig {
  /**
   * enable dirty check for displayobject
   */
  enableDirtyCheck: boolean;

  /**
   * enable culling
   */
  enableCulling: boolean;

  /**
   * enable dirty rectangle rendering
   */
  enableDirtyRectangleRendering: boolean;

  /**
   * enable debugging dirty rectangle, Canvas will trigger CanvasEvent.DIRTY_RECTANGLE
   */
  enableDirtyRectangleRenderingDebug: boolean;

  /**
   * enable auto rendering
   */
  enableAutoRendering: boolean;

  // plugins:
}

/**
 * eg. NodeCanvas, OffscreenCanvas, HTMLCanvasElement
 */
export interface CanvasLike extends EventTarget {
  width: number;
  height: number;

  getContext: ((
    contextId: '2d',
    contextAttributes?: CanvasRenderingContext2DSettings,
  ) => CanvasRenderingContext2D | null) &
    ((
      contextId: 'webgl',
      contextAttributes?: WebGLContextAttributes,
    ) => WebGLRenderingContext | null) &
    ((
      contextId: 'webgl2',
      contextAttributes?: WebGLContextAttributes,
    ) => WebGL2RenderingContext | null);

  addEventListener: (<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) => void) &
    ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => void);
  removeEventListener: (<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ) => void) &
    ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) => void);
}

export interface CanvasConfig {
  /**
   * Renderer
   */
  renderer: IRenderer;

  /**
   * document.getElementById(container);
   */
  container?: string | HTMLElement;

  /**
   * support OffscreenCanvas
   */
  canvas?: CanvasLike;

  /**
   * used in JSDOM
   */
  document?: Document;

  /**
   * used in text measurement & texture generation
   */
  offscreenCanvas?: CanvasLike;

  /**
   * window.devicePixelRatio
   */
  devicePixelRatio?: number;

  /**
   * rAF
   */
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (id: number) => void;

  /**
   * replace `new window.Image()`
   */
  createImage?: (src: string) => HTMLImageElement;

  /**
   * limits query
   */
  supportsPointerEvents?: boolean;
  // supportMouseEvent?: () => boolean;
  supportsTouchEvents?: boolean;
  isTouchEvent?: (event: InteractivePointerEvent) => event is TouchEvent;
  isMouseEvent?: (event: InteractivePointerEvent) => event is MouseEvent;
  /**
   * Listen to native click event instead of mocking with pointerup & down events.
   */
  useNativeClickEvent?: boolean;

  /**
   * Pointermove / up / cancel event will get triggered even outside Canvas.
   */
  alwaysTriggerPointerEventOnCanvas?: boolean;

  /**
   * Should we account for CSS Transform applied on container?
   */
  supportsCSSTransform?: boolean;

  /**
   * 画布宽度
   */
  width?: number;
  /**
   * 画布高度
   */
  height?: number;

  /**
   * 画布背景色
   */
  background?: ColorType;

  /**
   * 画布的 cursor 样式
   */
  cursor?: Cursor;

  [key: string]: any;
}

/**
 * The format to use when defining custom easing functions
 */
export type TypeEasingFunction = (
  t: number,
  params?: (string | number)[],
  duration?: number,
) => number;

export type InteractivePointerEvent =
  | PointerEvent
  | TouchEvent
  | MouseEvent
  | WheelEvent;

// @see https://github.com/zhanba/pailye/blob/master/packages/flex/src/types.ts
export type Tuple4<T> = [T, T, T, T];

export type Tuple4Number = Tuple4<number>;

export type Tuple3<T> = [T, T, T];

export type Tuple3Number = Tuple3<number>;

export type ComninedValue<T> = T | [T] | [T, T] | [T, T, T] | Tuple4<T>;

export type CombinedNumber = ComninedValue<number>;

export type Length = number;

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Percentage = `${Digit}%` | `${Digit}${Digit}%`;

export type LengthOrPercentage = Length | Percentage;
export type LengthOrPercentageOrAuto = Length | Percentage | 'auto';

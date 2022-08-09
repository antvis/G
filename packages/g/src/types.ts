import type { vec2, vec3 } from 'gl-matrix';
import { Syringe } from 'mana-syringe';
import type { IEventTarget } from '.';
import type { IRenderer } from './AbstractRenderer';
import type {
  CSSGlobalKeywords,
  CSSGradientValue,
  CSSKeywordValue,
  CSSRGB,
  CSSUnitValue,
  ParsedFilterStyleProperty,
  ParsedTransform,
  Pattern,
} from './css';
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
    | 'bounding-box'
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
  clipPathTargets?: DisplayObject[];

  /**
   * offset path
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path
   */
  offsetPath?: DisplayObject | null;
  offsetPathTargets?: DisplayObject[];
  offsetDistance?: number;

  stroke?: ColorType | Pattern;
  /** 描边透明度 */
  strokeOpacity?: number;
  /** 填充颜色 */
  fill?: ColorType | Pattern;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 整体透明度 */
  opacity?: number;

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
  lineDash?: string | (string | number)[];

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
    | 'opacity'
    | 'strokeOpacity'
    | 'fillOpacity'
    | 'fill'
    | 'stroke'
    | 'lineWidth'
    | 'increasedLineWidthForHitTesting'
    | 'lineJoin'
    | 'lineCap'
    | 'lineDash'
    | 'lineDashOffset'
    | 'path'
    | 'points'
    | 'shadowType'
    | 'shadowColor'
    | 'shadowBlur'
    | 'shadowOffsetX'
    | 'shadowOffsetY'
    | 'visibility'
    | 'pointerEvents'
    | 'zIndex'
    | 'transform'
    | 'transformOrigin'
    | 'textTransform'
    | 'offsetDistance'
    | 'miterLimit'
    | 'filter'
  > {
  zIndex?: CSSUnitValue;
  visibility?: CSSKeywordValue;
  pointerEvents?: CSSKeywordValue;
  opacity?: CSSUnitValue;
  fillOpacity?: CSSUnitValue;
  strokeOpacity?: CSSUnitValue;
  fill?: CSSRGB | CSSGradientValue[] | Pattern;
  stroke?: CSSRGB | CSSGradientValue[] | Pattern;
  lineDash?: [CSSUnitValue, CSSUnitValue];
  lineCap?: CSSKeywordValue;
  lineJoin?: CSSKeywordValue;
  lineDashOffset?: CSSUnitValue;
  offsetDistance?: CSSUnitValue;

  anchor?: [CSSUnitValue, CSSUnitValue, CSSUnitValue];
  transform: ParsedTransform[];
  transformOrigin?: [CSSUnitValue, CSSUnitValue, CSSUnitValue];

  width?: CSSUnitValue;
  height?: CSSUnitValue;
  lineWidth?: CSSUnitValue;
  increasedLineWidthForHitTesting?: CSSUnitValue;
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
  shadowType?: CSSKeywordValue;
  shadowColor?: CSSRGB;
  shadowBlur?: CSSUnitValue;
  shadowOffsetX?: CSSUnitValue;
  shadowOffsetY?: CSSUnitValue;
  textTransform?: CSSKeywordValue;
  miterLimit?: CSSUnitValue;
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
export interface CanvasLike extends IEventTarget {
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

export const CanvasConfig = Syringe.defineToken('CanvasConfig');
// eslint-disable-next-line @typescript-eslint/no-redeclare
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

export type InteractivePointerEvent = PointerEvent | TouchEvent | MouseEvent | WheelEvent;

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

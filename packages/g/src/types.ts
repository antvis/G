import type { IRenderer } from './AbstractRenderer';
import type { DisplayObject } from './DisplayObject';

export enum SHAPE {
  Custom = 'custom',
  Group = 'group',
  Circle = 'circle',
  Ellipse = 'ellipse',
  Image = 'image',
  Rect = 'rect',
  Line = 'line',
  Polyline = 'polyline',
  Polygon = 'polygon',
  Text = 'text',
  Path = 'path',
}

type ColorType = string | null;

export interface EventPosition {
  clientX: number;
  clientY: number;
  x: number;
  y: number;
}

export interface BaseStyleProps {
  /**
   * x in local space
   */
  x?: number;

  /**
   * y in local space
   */
  y?: number;

  /**
   * the origin of rotation and scaling, default to (0, 0)
   */
  origin?: [number, number];

  /**
   * how do we define the 'position' of a shape?
   * eg. the default anchor of a Rect is top-left, we can change it to its' center [0.5, 0.5].
   */
  anchor?: [number, number];

  /**
   * visibility in CSS
   */
  visibility?: 'visible' | 'hidden';

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

  stroke?: ColorType;
  /** 描边透明度 */
  strokeOpacity?: number;
  /** 填充颜色 */
  fill?: ColorType;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 整体透明度 */
  opacity?: number;
  /** 线宽 */
  lineWidth?: number;
  lineAppendWidth?: number;
  /** 指定如何绘制每一条线段末端 */
  lineCap?: 'butt' | 'round' | 'square';
  /** 用来设置2个长度不为0的相连部分（线段，圆弧，曲线）如何连接在一起的属性（长度为0的变形部分，其指定的末端和控制点在同一位置，会被忽略） */
  lineJoin?: 'bevel' | 'round' | 'miter';
  /**
   * 设置线的虚线样式，可以指定一个数组。一组描述交替绘制线段和间距（坐标空间单位）长度的数字。 如果数组元素的数量是奇数， 数组的元素会被复制并重复。例如， [5, 15, 25] 会变成 [5, 15, 25, 5, 15, 25]。这个属性取决于浏览器是否支持 setLineDash() 函数。
   */
  lineDash?: number[] | null;

  [key: string]: any;
}

// export type ShapeAttrs = {
//   /** 圆半径 */
//   r?: number;

//
//   /** Path 路径 */
//   path?: string | object[];
//   /** 图形坐标点 */
//   points?: object[];

//   /** 阴影模糊效果程度 */
//   shadowBlur?: number;
//   /** 阴影颜色 */
//   shadowColor?: ColorType;
//   /** 阴影 x 方向偏移量 */
//   shadowOffsetX?: number;
//   /** 阴影 y 方向偏移量 */
//   shadowOffsetY?: number;
//

// };

// export type ClipCfg = {
//   /**
//    * 作为 clip 的图形
//    * @type {string}
//    */
//   type: string;
//   /**
//    * 图形的属性
//    * @type {ShapeAttrs}
//    */
//   attrs: ShapeAttrs;
// };

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
   * enable dirty rectangle rendering
   */
  enableDirtyRectangleRendering: boolean;

  enableDirtyRectangleRenderingDebug: boolean;

  /**
   * enable auto rendering
   */
  enableAutoRendering: boolean;

  /**
   * enable TAA in WebGL
   */
  enableTAA: boolean;
}

export const CanvasConfig = Symbol('CanvasConfig');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvasConfig {
  /**
   * Renderer
   */
  renderer: IRenderer;
  /**
   * 容器
   * @type {string|HTMLElement}
   */
  container: string | HTMLElement;
  /**
   * 画布宽度
   * @type {number}
   */
  width: number;
  /**
   * 画布高度
   * @type {number}
   */
  height: number;
  /**
   * 是否可监听
   * @type {boolean}
   */
  capture?: boolean;

  /**
   * 画布的 cursor 样式
   * @type {Cursor}
   */
  cursor?: Cursor;

  [key: string]: any;
}

export type ChangeType =
  | 'changeSize'
  | 'add'
  | 'sort'
  | 'clear'
  | 'attr'
  | 'show'
  | 'hide'
  | 'zIndex'
  | 'remove'
  | 'matrix'
  | 'clip';

export type GroupFilter = (group: DisplayObject) => boolean;

type A = ['a' | 'A', number, number, number, number, number, number, number];
type C = ['c' | 'C', number, number, number, number, number, number];
type O = ['o' | 'O', number, number];
type H = ['h' | 'H', number];
type L = ['l' | 'L', number, number];
type M = ['m' | 'M', number, number];
type R = ['r' | 'R', number, number, number, number];
type Q = ['q' | 'Q', number, number, number, number];
type S = ['s' | 'S', number, number, number, number, number, number, number];
type T = ['t' | 'T', number, number];
type V = ['v' | 'V', number];
type U = ['u' | 'U', number, number, number];
type Z = ['z' | 'Z'];
export type PathCommand = A | C | O | H | L | M | R | Q | S | T | V | U | Z;

export type InteractivePointerEvent = PointerEvent | TouchEvent | MouseEvent | WheelEvent;

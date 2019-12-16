import { IShape, ICtor } from './interfaces';

export type BBox = {
  x: number;
  y: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

type ColorType = string | null;

export type ElementAttrs = {
  [key: string]: any;
};

export type ShapeAttrs = {
  x?: number;
  y?: number;
  r?: number;
  stroke?: ColorType;
  strokeOpacity?: number;
  fill?: ColorType;
  fillOpacity?: number;
  lineWidth?: number;
  path?: string | object[];
  points?: object[];
  [key: string]: any;
};

type ElementCfg = {
  /**
   * 元素 id,可以为空
   * @type {String}
   */
  id?: string;
  /**
   * 层次索引，决定绘制的先后顺序
   * @type {Number}
   */
  zIndex?: number;
  /**
   * 是否可见
   * @type {Boolean}
   */
  visible?: boolean;
  /**
   * 是否可以拾取
   * @type {Boolean}
   */
  capture?: boolean;
};

export type ShapeCfg = ElementCfg & {
  /**
   * 图形的属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs;
  [key: string]: any;
};

export type GroupCfg = {
  [key: string]: any;
};

export type ClipCfg = {
  /**
   * 作为 clip 的图形
   * @type {string}
   */
  type: string;
  /**
   * 图形的属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs;
};

export type Renderer = 'canvas' | 'svg';

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

export type CanvasCfg = {
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
   * 只读属性，渲染引擎
   * @type {string}
   */
  renderer?: Renderer;

  /**
   * 画布的 cursor 样式
   * @type {Cursor}
   */
  cursor?: Cursor;
  [key: string]: any;
};

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

export type AnimateCfg = {
  /**
   * 动画执行时间
   * @type {number}
   */
  duration: number;
  /**
   * 动画缓动效果
   * @type {string}}
   */
  easing?: string;
  /**
   * 动画执行的延迟时间
   * @type {function}}
   */
  delay?: number;
  /**
   * 是否重复执行动画
   * @type {boolean}}
   */
  repeat?: boolean;
  /**
   * 动画执行完时的回调函数
   * @type {function}}
   */
  callback?: () => void;
  /**
   * 动画暂停时的回调函数
   * @type {function}}
   */
  pauseCallback?: () => void;
  /**
   * 动画恢复(重新唤醒)时的回调函数
   * @type {function}}
   */
  resumeCallback?: () => void;
};

export type OnFrame = (ratio: number) => ElementAttrs;

export type Animation = AnimateCfg & {
  id: string;
  fromAttrs: {
    [key: string]: any;
  };
  toAttrs: {
    [key: string]: any;
  };
  startTime: number;
  pathFormatted: boolean;
  onFrame?: OnFrame;
  _paused?: boolean;
  _pauseTime?: number;
};

export type ShapeBase = {
  [key: string]: ICtor<IShape>;
};

export type ElementFilterFn = (IElement) => boolean;

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

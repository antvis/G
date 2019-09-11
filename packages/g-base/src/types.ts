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

export type CanvasCfg = {
  /**
   * 容器
   * @type {string|HtmlElement}
   */
  container: string;
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

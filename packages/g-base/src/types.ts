
export type BBox = {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
};

type ColorType = string | null;

export type ShapeAttrs = {
  x?: number,
  y?: number,
  stroke?: ColorType,
  fill?: ColorType,
  lineWidth?: number,
};

type ElementCfg = {  /**   * 图形元素的 id, 用于查找元素   * @type {String}   */
  id?: string,  /**   * 层次索引，决定绘制的先后顺序   * @type {Number}   */
  zIndex?: number,  /**   * 是否可见   * @type {Boolean}   */
  visible?: boolean,  /**   * 是否可拾取   * @type {Boolean}   */
  capture?: boolean,
};

export type ShapeCfg = ElementCfg & {
  attrs: ShapeAttrs,
  [key: string]: any,
};

export type GroupCfg = {
  [key: string]: any,
};

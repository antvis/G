import type { DisplayObjectConfig } from '@antv/g';

/**
 * Row 单个组件的 attr 属性
 */
export type RowAttr = {
  /**
   * 行头单元格的索引
   */
  index: number;
  /**
   * x 位置
   */
  x: number;
  /**
   * y 位置
   */
  y: number;
  /**
   * 宽度
   */
  width: number;
  /**
   * 高度
   */
  height: number;
  /**
   * 文本的样式
   */
  textStyle?: any;
};

/**
 * Row 组件的配置类型定义
 */
export type RowOptions = DisplayObjectConfig<RowAttr>;

/**
 * 多行的 row 组件容器
 */
export type RowsAttr = {
  /**
   * 容器的 x
   */
  x: number;
  /**
   * 容器的 y
   */
  y: number;
  /**
   * 容器的 width
   */
  width: number;
  /**
   * 容器的 height
   */
  height: number;
  /**
   * 外部滚动条的偏移量，对应的是 y offset
   */
  offset: number;
  /**
   * 不同行对应的高度信息，用于计算显示哪些 index 的单元格
   */
  heights: number[];
};

/**
 * Rows 容器的组件类型定义配置
 */
export type RowsOptions = DisplayObjectConfig<RowsAttr>;

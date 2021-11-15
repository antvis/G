import type { DisplayObjectConfig } from '@antv/g';
import type { RowAttr } from '../rows/types';

/**
 * Col 单个组件的 attr 属性
 */
export type ColAttr = RowAttr;

/**
 * Row 组件的配置类型定义
 */
export type ColOptions = DisplayObjectConfig<ColAttr>;

/**
 * 多列的 cols 组件容器
 */
export type ColsAttr = {
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
   * 不同列对应的高度信息，用于计算显示哪些 index 的单元格
   */
  widths: number[];
};

/**
 * Rows 容器的组件类型定义配置
 */
export type ColsOptions = DisplayObjectConfig<ColsAttr>;

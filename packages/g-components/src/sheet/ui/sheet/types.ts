import type { DisplayObjectConfig } from '@antv/g';
import type { SheetData } from '../../types';

/**
 * 电子表格的配置项
 */
export type SheetAttr = {
  /**
   * 整个 sheet 整体容器的 x，包含有 tab le
   */
  x: number;
  /**
   * 整个 sheet 整体容器的 y
   */
  y: number;
  /**
   * 整个 sheet 整体容器的 width
   */
  width: number;
  /**
   * 整个 sheet 整体容器的 height
   */
  height: number;
} & SheetData;

export type SheetOptions = DisplayObjectConfig<SheetAttr>;

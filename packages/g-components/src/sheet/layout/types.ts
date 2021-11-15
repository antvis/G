import { SheetData } from '../types';

export type LayoutOptions = {
  /**
   * 布局容器的 x，一般默认为 0
   */
  x: number;
  /**
   * 布局容器的 y，一般默认为 0
   */
  y: number;
  /**
   * 布局容器的 width，一般默认为画布宽度
   */
  width: number;
  /**
   * 布局容器的 height，一般默认为画布高度
   */
  height: number;
  /**
   * 列头的信息
   */
  cols: SheetData['cols'];
  /**
   * 行头的信息
   */
  rows: SheetData['rows'];
  /**
   * 默认的 col 宽度，默认为 100
   */
  colWidth?: number;
  /**
   * 默认的 row 高度，默认为 24
   */
  rowHeight?: number;
};

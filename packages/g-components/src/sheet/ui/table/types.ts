import type { DisplayObjectConfig } from '@antv/g';
import { Layout } from '../../layout';
import { DataSet } from '../../data-set';

export type CellAttr = {
  /**
   * 列索引
   */
  col: number;
  /**
   * 行索引
   */
  row: number;
  /**
   * 位置 x
   */
  x: number;
  /**
   * 位置 y
   */
  y: number;
  /**
   * 宽度
   */
  width: number;
  /**
   * height
   */
  height: number;
  /**
   * 对应的文本内容
   */
  text?: string;
  /**
   * 公式，属于计算单元格
   */
  formula?: string;
  /**
   * // todo 暂时不加，后面直接用 GUI 中的富文本
   * 对应富文本的一些配置项，比如：下划线、加粗、颜色、字体、字号等等。
   */
};

export type CellOptions = DisplayObjectConfig<CellAttr>;

export type TableAttr = {
  /**
   * 表格容器的 x
   */
  x: number;
  /**
   * 表格容器的 y
   */
  y: number;
  /**
   * 表格容器的 宽度
   */
  width: number;
  /**
   * 表格容器的 高度
   */
  height: number;
  /**
   * 偏移 x
   */
  offsetX: number;
  /**
   * 偏移 y
   */
  offsetY: number;
  /**
   * 数据来源
   */
  dataSet: DataSet;
  /**
   * 布局，位置大小数据的来源
   */
  layout: Layout;
};

export type TableOptions = DisplayObjectConfig<TableAttr>;

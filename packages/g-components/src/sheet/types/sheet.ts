/**
 * 定义 sheet 存储的数据结构
 */

/**
 * 标识一个 sheet 单元格范围
 */
export type CellRange = {
  /**
   * start column index
   */
  sci: number;
  /**
   * start row index
   */
  sri: number;
  /**
   * end column index
   */
  eci: number;
  /**
   * end row index
   */
  eri: number;
};

// 文本单元格数据，之后 会添加各种其他的样式到里面
export type CellData = {
  /**
   * 单元格的静态文本
   */
  text?: string;
  /**
   * 公式模式
   */
  formula?: string;
  // 样式相关的
  /**
   * 单元格背景掩饰
   */
  backgroundStyle?: any;
  /**
   * 单元格的文本样式
   */
  textStyle?: any;
  /**
   * // todo
   * 还有其他的一些富文本配置，比如：
   * - 下划线
   * - 对齐方式
   * - 字体
   * - ...
   */
};

export type ColData = {
  /**
   * 所在的索引
   */
  index: number;
  /**
   * 单元格宽度
   */
  width: number;
};

export type RowData = {
  /**
   * 所在的索引
   */
  index: number;
  /**
   * 单元格高度
   */
  height: number;
};

/**
 * 表格的数据结构
 */
export type SheetData = {
  /**
   * 单元格的数据（k-v 的形式）
   */
  data: Record<string, CellData>;
  /**
   * 列头的信息
   */
  cols: Record<string, ColData>;
  /**
   * 列头的高度
   */
  colHeight: number;
  /**
   * 行头的信息
   */
  rows: Record<string, RowData>;
  /**
   * 行头的宽度
   */
  rowWidth: number;
  /**
   * 冻结 [行头，列头]
   */
  freeze?: [number, number];
  /**
   * 合并单元格
   */
  merges?: CellRange[];
  /**
   * 选中的数据
   */
  selection?: CellRange;
};

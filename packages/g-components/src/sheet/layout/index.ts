import { sum } from '../helper/statistic';
import { ColData, RowData, CellRange } from '../types';
import { LayoutOptions } from './types';

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;

/**
 * 具体对应到 Table 的布局逻辑，可以包含有：
 * -[x] 行头列头位置
 * -[x] 单元格定位
 * -[ ] 无限画布的布局 // todo
 */
export class Layout {
  /**
   * 布局的信息
   */
  public options: LayoutOptions;
  /**
   * 所有的宽度
   */
  private widths: number[] = [];
  /**
   * 所有的高度
   */
  private heights: number[] = [];

  constructor(options: LayoutOptions) {
    this.options = options;
  }

  /**
   * 更新配置
   * @param options
   */
  public update(options: Partial<LayoutOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 执行布局逻辑
   */
  public run() {
    const {
      cols,
      colWidth = DEFAULT_COL_WIDTH,
      rows,
      rowHeight = DEFAULT_ROW_HEIGHT,
    } = this.options;

    // 先赋予默认值，然后指定的 index w h 设置好即可。
    // todo 当前是写死 999 行，怎么无限画布？
    this.widths = new Array(999).fill(colWidth);
    this.heights = new Array(999).fill(rowHeight);

    Object.values(cols).forEach((v: ColData) => {
      this.widths[v.index] = v.width;
    });

    Object.values(rows).forEach((v: RowData) => {
      this.heights[v.index] = v.height;
    });
  }

  /**
   * 对应列头的所有宽度
   * @returns
   */
  public getWidths(): number[] {
    return this.widths;
  }

  /**
   * 对应行头的所有高度
   * @returns
   */
  public getHeights(): number[] {
    return this.heights;
  }

  /**
   * 获取单元格的位置大小
   * [x, y, w, h]
   * @param col
   * @param row
   */
  public getBBox(col: number, row: number) {
    return [
      sum(this.widths.slice(0, col)),
      sum(this.heights.slice(0, row)),
      this.widths[col],
      this.heights[row],
    ];
  }

  /**
   * 获取一个范围的 bbox
   * @param selection
   */
  public getSelectionBBox(selection: CellRange) {
    if (!selection) return null;

    let { sci, sri, eci, eri } = selection;
    // 最大最小
    const [sx, sy] = this.getBBox(Math.min(sci, eci), Math.min(sri, eri));
    const [ex, ey, ew, eh] = this.getBBox(Math.max(eci, sci), Math.max(eri, sri));

    return [sx, sy, ex - sx + ew, ey - sy + eh];
  }
}

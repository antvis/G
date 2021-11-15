import { CustomElement, Rect } from '@antv/g';
import { Cell } from './cell';
import type { CellAttr, TableAttr, TableOptions } from './types';
import { calculateViewportItems } from '../rows/helper';
import { diffCellsInView } from '../../helper/diff';
import { getCellKey } from '../../helper/calc';

/** 表格 暂时没有添加其他样式修改方法， 之后再改 */
export class Table extends CustomElement<TableAttr> {
  /**
   * 组件 tabel
   */
  public static tag = 'table';
  /**
   * 单元格 Map
   */
  public cells = new Map<string, Cell>();
  /**
   * 裁剪的形状
   */
  private clipShape: Rect;
  /**
   * 视窗内的单元格
   * [startCol, endCol, startRow, endRow]
   */
  private viewportIndexes: number[] = [];

  constructor(options: TableOptions) {
    super(options);

    this.init();
  }

  /**
   * 手动设置偏移量，对外透漏的 API
   * @param offsetX
   */
  public setOffsetX(offsetX: number) {
    this.update({ offsetX });
  }

  /**
   * 手动设置偏移量，对外透漏的 API
   * @param offsetY
   */
  public setOffsetY(offsetY: number) {
    this.update({ offsetY });
  }

  public setOffset(offsetX: number, offsetY: number) {
    this.update({ offsetX, offsetY });
  }

  /**
   * 初始化
   */
  public init(): void {
    this.update();
  }

  /**
   * 组件的更新
   */
  public update(attr?: Partial<TableAttr>) {
    this.attr(attr);

    const { x, y, width, height, layout, offsetX, offsetY } = this.attributes;

    if (!this.clipShape) {
      this.clipShape = new Rect({
        style: {
          x: 0,
          y: 0,
          width,
          height,
        },
      });

      // 因为类型定义没有去 extends G 底层的定义，所以没有 clipPath 属性（暂时也不暴漏出去吧）
      // @ts-ignore
      this.attr({
        clipPath: this.clipShape,
      });
    }

    const widths = layout.getWidths();
    const heights = layout.getHeights();

    // 计算视窗内的行列索引，处理按需加载
    const rowIndexes = calculateViewportItems(offsetY, height, heights);
    const colIndexes = calculateViewportItems(offsetX, width, widths);

    const nextIndexes = [...colIndexes, ...rowIndexes];
    const { add, remove, update } = diffCellsInView(this.viewportIndexes, nextIndexes);

    // 删除、销毁、移除缓存
    remove.forEach(({ col, row }) => {
      const key = getCellKey(col, row);
      const cell = this.cells.get(key);
      this.cells.delete(key);
      // todo 为什么会出现找不到？
      if (cell) {
        this.removeChild(cell);
      }
    });

    // 更新配置
    update.forEach(({ col, row }) => {
      const key = getCellKey(col, row);
      const cell = this.cells.get(key);
      if (cell) {
        cell.update(this.getCellAttr(col, row));
      }
    });

    // 新建，并缓存
    add.forEach(({ col, row }) => {
      const key = getCellKey(col, row);
      const options = {
        name: 'cell',
        style: this.getCellAttr(col, row),
      };
      const cell = new Cell(options);

      this.cells.set(key, cell);
      this.appendChild(cell);
    });

    // 最后更新索引缓存
    this.viewportIndexes = nextIndexes;
  }

  /**
   * 根据行列索引获取配置
   * @param col
   * @param row
   * @returns
   */
  private getCellAttr(col: number, row: number): CellAttr {
    const { layout, offsetX, offsetY, dataSet } = this.attributes;
    const [x, y, width, height] = layout.getBBox(col, row);
    return {
      col,
      row,
      x: x - offsetX,
      y: y - offsetY,
      width,
      height,
      text: dataSet.getValue(col, row),
    };
  }

  /**
   * 组件的清理
   */
  public clear() {}

  /**
   * 组件的销毁 + 事件去除
   */
  public destroy() {
    this.removeChildren(true);
    super.destroy();
  }
}

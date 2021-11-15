import { Interaction } from '../interaction';
import type { Cell } from '../../ui/table/cell';
import type { CellRange } from '../../types';

/**
 * 选中的交互：
 * - 单选单元格
 * - 圈选
 * - 行选
 * - 列选
 */
export class Selection extends Interaction {
  /**
   * 圈选的范围
   */
  private selection: CellRange;

  /**
   * 绑定事件
   */
  public init() {
    // 鼠标点击的时候，选中当前 cell
    this.spreadsheet.sheet.addEventListener('mousedown', this.onMousedown);
  }

  private onMousedown = (e) => {
    const cell = e.composedPath().find((el) => el.name === 'cell') as Cell;

    if (cell) {
      // 绑定 mouseup
      // 绑定滑动事件
      // 选中圈选区域
      this.spreadsheet.sheet.addEventListener('mousemove', this.onMousemove);
      this.spreadsheet.sheet.addEventListener('mouseup', this.onMouseup);

      // 选中当前
      const col = cell.getCol();
      const row = cell.getRow();

      this.selection = {
        sci: col,
        sri: row,
        eci: col,
        eri: row,
      };

      this.spreadsheet.sheet.update({ selection: this.selection });
    }
  };

  private onMousemove = (e) => {
    const cell = e.composedPath().find((el) => el.name === 'cell') as Cell;
    if (cell) {
      // 选中当前
      const col = cell.getCol();
      const row = cell.getRow();

      // move 过程中的选中范围
      this.selection = {
        sci: this.selection.sci,
        sri: this.selection.sri,
        eci: col,
        eri: row,
      };

      this.spreadsheet.sheet.update({ selection: this.selection });
    }
  };

  private onMouseup = (e) => {
    this.spreadsheet.sheet.removeEventListener('mousemove', this.onMousemove);
    this.spreadsheet.sheet.removeEventListener('mouseup', this.onMouseup);
  };

  public destroy() {
    this.spreadsheet.sheet.removeEventListener('mousedown', this.onMousedown);
    this.spreadsheet.sheet.removeEventListener('mousemove', this.onMousemove);
    this.spreadsheet.sheet.removeEventListener('mouseup', this.onMouseup);
  }
}

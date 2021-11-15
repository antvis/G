import { Interaction } from '../interaction';
import type { Cell } from '../../ui/table/cell';

// todo 走主题
const HOVER_COLOR = '#EEF3FE';

/**
 * hover 单元格，高亮行列的交互
 */
export class Hover extends Interaction {
  /**
   * 单元格上一个颜色
   */
  private prevFillColor: string;

  /**
   * 绑定事件
   */
  public init() {
    this.spreadsheet.sheet.addEventListener('mouseover', this.onCellMouseover);
    this.spreadsheet.sheet.addEventListener('mouseout', this.onCellMouseout);
  }

  private onCellMouseover = (e) => {
    const cell = e.composedPath().find((el) => el.name === 'cell') as Cell;
    // 保存之前的颜色
    this.prevFillColor = cell?.backgroundShape.attr('fill');

    cell?.backgroundShape.attr('fill', HOVER_COLOR);
  };

  private onCellMouseout = (e) => {
    const cell = e.composedPath().find((el) => el.name === 'cell') as Cell;
    // 还原之前的颜色
    cell?.backgroundShape.attr('fill', this.prevFillColor);
  };

  public destroy() {
    this.spreadsheet.sheet.removeEventListener('mouseover', this.onCellMouseover);
    this.spreadsheet.sheet.removeEventListener('mouseout', this.onCellMouseout);
  }
}

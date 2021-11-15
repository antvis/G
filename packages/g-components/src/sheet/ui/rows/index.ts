import { CustomElement } from '@antv/g';
import { diffIndexes } from '../../helper/diff';
import { sum } from '../../helper/statistic';
import { calculateViewportItems } from './helper';
import { Row } from './row';
import type { RowAttr, RowsAttr, RowsOptions } from './types';

/**
 * 行头
 * 看图：https://gw.alipayobjects.com/zos/antfincdn/gC66e9J2J4/a6f4ac12-2199-47bf-8f33-7d554fd32e8d.png
 * 核心逻辑：
 * - 根据 offset、容器大小，计算当前应该绘制哪些 Row，以及按需渲染
 * - 提供 setOffset API，便于上层集成
 */
export class Rows extends CustomElement<RowsAttr> {
  /**
   * 组件 Rows
   */
  public static tag = 'rows';
  /**
   * 所有的子 row Map<index, Row>
   */
  public rows = new Map<number, Row>();
  /**
   * // todo 暂时不绘制，后续再处理
   * 所有的线条
   */
  public grids = [];
  /**
   * 绘制的时候，绘制了哪些 index 的单元格
   * [start, end]
   */
  private viewportIndexes: number[] = [];

  constructor(options: RowsOptions) {
    super(options);
    this.init();
  }

  /**
   * 手动设置偏移量，对外透漏的 API
   * @param offset
   */
  public setOffset(offset: number) {
    this.update({ offset });
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
  public update(attr?: Partial<RowsAttr>) {
    this.attr(attr);

    const { offset, height, heights } = this.attributes;
    // 根据视窗，按需加载
    const indexes = calculateViewportItems(offset, height, heights);
    const { add, update, remove } = diffIndexes(this.viewportIndexes, indexes);

    // 删除、销毁、移除缓存
    remove.forEach((idx: number) => {
      const row = this.rows.get(idx);
      this.removeChild(row, true);
      this.rows.delete(idx);
    });

    // 更新配置
    update.forEach((idx: number) => {
      this.rows.get(idx).update(this.getRowAttr(idx));
    });

    // 新建，并缓存
    add.forEach((idx: number) => {
      const options = {
        name: 'row',
        style: this.getRowAttr(idx),
      };
      const row = new Row(options);

      this.rows.set(idx, row);
      this.appendChild(row);
    });

    this.viewportIndexes = indexes;
  }

  /**
   * 根据 idx 获取更新配置
   */
  private getRowAttr(index: number): RowAttr {
    const { offset, x, y, width, heights } = this.attributes;
    return {
      index,
      x,
      y: sum(heights.slice(0, index)) - offset,
      width,
      height: heights[index],
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

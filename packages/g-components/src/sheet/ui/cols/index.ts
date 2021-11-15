import { CustomElement } from '@antv/g';
import { diffIndexes } from '../../helper/diff';
import { sum } from '../../helper/statistic';
import { calculateViewportItems } from '../rows/helper';
import { Col } from './col';
import type { ColAttr, ColsAttr, ColsOptions } from './types';

/**
 * 列头
 * 看图：https://gw.alipayobjects.com/zos/antfincdn/5iRkHpEIxo/bc9af19f-bd19-42df-8a4e-2b28407505ee.png
 * 核心逻辑：
 * - 根据 offset、容器大小，计算当前应该绘制哪些 Col，以及按需渲染
 * - 提供 setOffset API，便于上层集成
 */
export class Cols extends CustomElement<ColsAttr> {
  /**
   * 组件 Cols
   */
  public static tag = 'clos';
  /**
   * 所有的子 col Map<index, Col>
   */
  public cols = new Map<number, Col>();
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

  constructor(options: ColsOptions) {
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
  public update(attr?: Partial<ColsAttr>) {
    this.attr(attr);

    const { offset, width, widths } = this.attributes;
    // 根据视窗，按需加载
    const indexes = calculateViewportItems(offset, width, widths);
    const { add, update, remove } = diffIndexes(this.viewportIndexes, indexes);

    // 删除、销毁、移除缓存
    remove.forEach((idx: number) => {
      const col = this.cols.get(idx);
      this.removeChild(col, true);
      this.cols.delete(idx);
    });

    // 更新配置
    update.forEach((idx: number) => {
      this.cols.get(idx).update(this.getColAttr(idx));
    });

    // 新建，并缓存
    add.forEach((idx: number) => {
      const options = {
        name: 'col',
        style: this.getColAttr(idx),
      };
      const row = new Col(options);

      this.cols.set(idx, row);
      this.appendChild(row);
    });

    this.viewportIndexes = indexes;
  }

  /**
   * 根据 idx 获取更新配置
   */
  private getColAttr(index: number): ColAttr {
    const { offset, x, y, height, widths } = this.attributes;
    return {
      index,
      x: sum(widths.slice(0, index)) - offset,
      y,
      width: widths[index],
      height,
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

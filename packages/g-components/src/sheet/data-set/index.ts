import { parseRowColumn } from '../helper/calc';
import { CellData } from '../types';
import { DataSetOptions } from './types';

/**
 * 整个电子表格 Table 区域的数据集模块，可以用于:
 * - 根据 row、col 来获取数据
 * - 根据 row、col 范围来获取圈选数据
 * - 公式处理
 * - 数据聚合
 * - ...
 */
export class DataSet {
  /**
   * 数据配置
   */
  private options: DataSetOptions;
  /**
   * 按照行列建立好二维 Map 的索引
   */
  public data = new Map<number, Map<number, CellData>>();

  constructor(options: DataSetOptions) {
    this.options = options;
  }

  /**
   * 处理数据，建立索引
   */
  public training() {
    // 清空，防止 update 的时候内存泄漏
    this.data = new Map<number, Map<number, CellData>>();

    const { data } = this.options;
    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const [col, row] = parseRowColumn(key);

      // 如果不存在，则创建
      if (!this.data.has(col)) {
        this.data.set(col, new Map<number, CellData>());
      }

      this.data.get(col).set(row, data[key]);
    }
  }

  public update(options: Partial<DataSetOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 根据 col, row 获取数据
   * @param rcolow
   * @param row
   */
  public getValue(col: number, row: number): string {
    // todo 处理公式等能力
    return this.data.get(col)?.get(row)?.text;
  }
}

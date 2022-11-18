/**
 * Chart 类，是使用 G2 进行绘图的入口。
 */
export class Chart {
  /**
   * 生命周期：渲染流程，渲染过程需要处理数据更新的情况。
   * render 函数仅仅会处理 view 和子 view。
   * @param isUpdate 是否触发更新流程。
   */
  render(isUpdate?: boolean): void;

  /**
   * This method will be removed at G2 V4.1
   */
  source(data: unknown): void;

  /**
   * 创建 Interval 几何标记。
   * @param [cfg] 传入 Interval 构造函数的配置。
   * @returns interval 返回 Interval 实例。
   */
  interval(cfg: unknown): any;

  /**
   * 配置 position 通道映射规则。
   *
   * @example
   * ```typescript
   * // 数据结构: [{ x: 'A', y: 10, color: 'red' }]
   * geometry.position('x*y');
   * geometry.position([ 'x', 'y' ]);
   * geometry.position({
   *   fields: [ 'x', 'y' ],
   * });
   * ```
   *
   * @param cfg 映射规则
   * @returns
   */
  position(cfg: string | string[]): any;

  /**
   * @example
   * ```typescript
   * // data: [{ x: 'A', y: 10, color: 'red' }, { x: 'B', y: 30, color: 'yellow' }]
   *
   * // 使用 '#1890ff' 颜色渲染图形
   * geometry.color('#1890ff');
   *
   * // 根据 x 字段的数据值进行颜色的映射，这时候 G2 会在内部调用默认的回调函数，读取默认提供的颜色进行数据值到颜色值的映射。
   * geometry.color('x');
   *
   * // 将 'x' 字段的数据值映射至指定的颜色值 colors（可以是字符串也可以是数组），此时用于通常映射分类数据
   * geometry.color('x', [ '#1890ff', '#5AD8A6' ]);
   *
   * // 使用回调函数进行颜色值的自定义；可以使用多个字段使用、*号连接
   * geometry.color('x', (xVal) => {
   *   if (xVal === 'a') {
   *     return 'red';
   *   }
   *   return 'blue';
   * });
   *
   * // 指定颜色的渐变路径，用于映射连续的数据
   * geometry.color('x', '#BAE7FF-#1890FF-#0050B3');
   * ```
   *
   * @param field 参与颜色映射的数据字段，多个字段使用 '*' 连接符进行连接。
   * @param cfg Optional, color 映射规则。
   * @returns
   */
  color(field: string, cfg?: string | string[]): any;
}

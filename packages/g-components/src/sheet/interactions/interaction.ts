import type { Spreadsheet } from '../index';
/**
 * 交互的机制
 */
export abstract class Interaction {
  /**
   * 交互实例持有的 spreadsheet 实例
   */
  protected spreadsheet: Spreadsheet;

  /**
   * 构造函数
   * @param spreadsheet
   */
  constructor(spreadsheet: Spreadsheet) {
    this.spreadsheet = spreadsheet;
  }

  /**
   * 初始化过程中，绑定事件
   */
  public abstract init();

  /**
   * 销毁交互，默认是空实现
   */
  public destroy() {}
}

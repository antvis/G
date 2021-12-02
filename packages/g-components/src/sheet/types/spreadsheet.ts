import { SheetData } from './sheet';

/**
 * 整个组件入口的配置项定义
 */
export type SpreadsheetOptions = {
  /**
   * 整个组件宽度
   */
  width: number;
  /**
   * 整个组件高度
   */
  height: number;
  /**
   * // todo 是否需要开启？开始之后包大小增加一倍
   * 渲染器
   */
  renderer?: 'canvas' | 'svg' | 'webgl';
} & SheetData;

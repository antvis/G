import type { DisplayObjectConfig } from '@antv/g';

/**
 * 圈选的配置项
 */
export type SelectorAttr = {
  /**
   * 圈选的位置 x
   */
  x: number;
  /**
   * 圈选的位置 y
   */
  y: number;
  /**
   * 圈选的区域宽度
   */
  width: number;
  /**
   * 圈选的区域高度
   */
  height: number;
  /**
   * 是否可见
   */
  visibility?: string;
};

export type SelectorOptions = DisplayObjectConfig<SelectorAttr>;

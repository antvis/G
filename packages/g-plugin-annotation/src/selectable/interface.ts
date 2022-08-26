import type { DisplayObject } from '@antv/g';

export interface Selectable extends DisplayObject {
  /**
   * move mask of selectable UI
   */
  moveMask: (dx: number, dy: number) => void;
}

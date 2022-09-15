import type { DisplayObject } from '@antv/g-lite';
import type { SelectablePlugin } from '../SelectablePlugin';
import type { SelectableStyle } from '../tokens';

export interface SelectableProps extends Partial<SelectableStyle> {
  target: DisplayObject;
}

export interface Selectable extends DisplayObject {
  plugin: SelectablePlugin;

  /**
   * move mask of selectable UI
   */
  moveMask: (dx: number, dy: number) => void;

  triggerMovingEvent: (dx: number, dy: number) => void;

  triggerMovedEvent: () => void;
}

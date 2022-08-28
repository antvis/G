import type { INode } from '../dom/interfaces';

export interface Sortable {
  /**
   * need to re-sort
   */
  dirty: boolean;

  /**
   * sorted child entities
   */
  sorted: INode[];

  /**
   * index in parent's children
   */
  lastSortedIndex: number;

  /**
   * render order in whole scenegraph
   */
  renderOrder: number;
}

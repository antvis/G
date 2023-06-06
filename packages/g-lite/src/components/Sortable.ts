import type { INode } from '../dom/interfaces';

export enum SortReason {
  ADDED,
  REMOVED,
  Z_INDEX_CHANGED,
}

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
   * render order in whole scenegraph
   */
  renderOrder: number;

  /**
   * dirty children
   */
  dirtyChildren: INode[];

  dirtyReason: SortReason;
}

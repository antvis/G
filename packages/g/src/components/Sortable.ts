import type { INode } from '../dom/interfaces';

export class Sortable {
  static tag = 'c-sortable';

  /**
   * need to re-sort
   */
  dirty = false;

  /**
   * sorted child entities
   */
  sorted: INode[];

  /**
   * index in parent's children
   */
  lastSortedIndex: number;
}

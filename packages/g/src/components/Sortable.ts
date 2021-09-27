import { Component } from '@antv/g-ecs';
import type { INode } from '../dom/interfaces';

export class Sortable extends Component {
  static tag = 'c-sortable';

  /**
   * need to re-sort
   */
  dirty = false;

  /**
   * sorted child entities
   */
  sorted: INode[];
}

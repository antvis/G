import { Component } from '@antv/g-ecs';
import type { Element } from '../dom/Element';

export class Sortable extends Component {
  static tag = 'c-sortable';

  /**
   * need to re-sort
   */
  dirty = false;

  /**
   * sorted child entities
   */
  sorted: Element[];
}

import { Component } from '@antv/g-ecs';
import { AABB } from '../shapes';

export class Geometry extends Component {
  static tag = 'c-geometry';

  /**
   * excluding all children
   */
  contentBounds: AABB | undefined;

  /**
   * including extra rendering effects, eg. shadowBlur filters(drop-shadow, blur)
   */
  renderBounds: AABB | undefined;
}

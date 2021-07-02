import { Component } from '@antv/g-ecs';
import { AABB } from '../shapes';

export class Geometry extends Component {
  static tag = 'c-geometry';

  aabb: AABB | undefined;
}

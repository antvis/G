import { Component } from '@antv/g-ecs';
import { AABB } from '../shapes';

export class Geometry extends Component {
  public static tag = 'c-geometry';

  public aabb: AABB;
}

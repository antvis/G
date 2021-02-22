import { Component, Entity } from '@antv/g-ecs';

export class Hierarchy extends Component {
  public static tag = 'c-hierarchy';
  public parentEntity: Entity;
}

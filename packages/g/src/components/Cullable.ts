import { Component } from '@antv/g-ecs';

/**
 * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#changing-mesh-culling-strategy
 */
export enum Strategy {
  Standard,
}

export class Cullable extends Component {
  static tag = 'c-cullable';

  strategy: Strategy = Strategy.Standard;

  visibilityPlaneMask = -1;

  visible = false;

  enable = true;
}

import { Component } from '@antv/g-ecs';

/**
 * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#changing-mesh-culling-strategy
 */
export enum Strategy {
  Standard,
}

export class Cullable extends Component {
  public static tag = 'c-cullable';

  public strategy: Strategy = Strategy.Standard;

  public visibilityPlaneMask = 0;

  public visible = false;
}

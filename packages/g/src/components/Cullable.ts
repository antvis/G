/**
 * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#changing-mesh-culling-strategy
 */
export enum Strategy {
  Standard,
}

export class Cullable {
  static tag = 'c-cullable';

  strategy: Strategy = Strategy.Standard;

  visibilityPlaneMask = -1;

  visible = true;

  enable = true;

  isCulled() {
    return this.enable && !this.visible;
  }
}

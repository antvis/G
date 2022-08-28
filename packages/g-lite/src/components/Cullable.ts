/**
 * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#changing-mesh-culling-strategy
 */
export enum Strategy {
  Standard,
}

export interface Cullable {
  strategy: Strategy;

  visibilityPlaneMask: number;

  visible: boolean;

  enable: boolean;
}

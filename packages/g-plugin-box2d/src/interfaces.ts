import type { DisplayObject } from '@antv/g-lite';
export interface Box2DPluginOptions {
  wasmUrl: string;
  gravity: [number, number];
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  onContact: (objectA: DisplayObject, object: DisplayObject) => void;
}

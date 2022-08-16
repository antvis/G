import type { DisplayObject } from '@antv/g';
import { Syringe } from '@antv/g';

export const Box2DPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface Box2DPluginOptions {
  wasmUrl: string;
  gravity: [number, number];
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  onContact: (objectA: DisplayObject, object: DisplayObject) => void;
}

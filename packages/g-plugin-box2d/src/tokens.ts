import { Syringe } from 'mana-syringe';
import type { DisplayObject } from '@antv/g';

export const Box2DPluginOptions = Syringe.defineToken('Box2DPluginOptions');
export interface Box2DPluginOptions {
  wasmUrl: string;
  gravity: [number, number];
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  onContact: (objectA: DisplayObject, object: DisplayObject) => void;
}

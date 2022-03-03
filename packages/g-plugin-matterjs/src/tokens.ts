import { Syringe } from 'mana-syringe';
import type { DisplayObject } from '@antv/g';

export const MatterJSPluginOptions = Syringe.defineToken('MatterJSPluginOptions');
export interface MatterJSPluginOptions {
  wasmUrl: string;
  gravity: [number, number];
  gravityScale: number;
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  onContact: (objectA: DisplayObject, object: DisplayObject) => void;
}

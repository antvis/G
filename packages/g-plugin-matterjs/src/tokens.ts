import { Syringe } from 'mana-syringe';

export const MatterJSPluginOptions = Syringe.defineToken('MatterJSPluginOptions');
export interface MatterJSPluginOptions {
  debug: boolean;
  debugContainer: HTMLElement;
  debugCanvasWidth: number;
  debugCanvasHeight: number;
  gravity: [number, number];
  gravityScale: number;
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
}

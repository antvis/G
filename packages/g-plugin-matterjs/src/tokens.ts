import { Syringe } from '@antv/g';

export const MatterJSPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
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

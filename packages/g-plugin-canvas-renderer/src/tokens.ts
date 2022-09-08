import { Syringe } from '@antv/g';

export const CanvasRendererPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvasRendererPluginOptions {
  dirtyObjectNumThreshold: number;
  dirtyObjectRatioThreshold: number;
}

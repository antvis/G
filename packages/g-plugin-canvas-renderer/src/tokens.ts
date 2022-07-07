import { Syringe } from '@antv/g';

export const CanvasRendererPluginOptions = Syringe.defineToken('CanvasRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvasRendererPluginOptions {
  dirtyObjectNumThreshold: number;
  dirtyObjectRatioThreshold: number;
}

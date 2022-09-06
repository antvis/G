import { Syringe } from '@antv/g-lite';

export const CanvasRendererPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvasRendererPluginOptions {
  dirtyObjectNumThreshold: number;
  dirtyObjectRatioThreshold: number;
}

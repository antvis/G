export const CanvasRendererPluginOptions = Symbol('CanvasRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvasRendererPluginOptions {
  dirtyObjectNumThreshold: number;
  dirtyObjectRatioThreshold: number;
}

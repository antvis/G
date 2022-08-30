export const WebGLRendererPluginOptions = Symbol('WebGLRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface WebGLRendererPluginOptions {
  targets: ('webgl1' | 'webgl2')[];
  onContextCreationError: (e: Event) => void;
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
}

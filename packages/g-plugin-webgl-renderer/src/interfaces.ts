export const WebGLRendererPluginOptions = 'WebGLRendererPluginOptions';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface WebGLRendererPluginOptions {
  targets: ('webgl1' | 'webgl2' | 'webgpu')[];
  onContextCreationError: (e: Event) => void;
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
}

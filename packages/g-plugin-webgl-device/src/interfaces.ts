import { Syringe } from 'mana-syringe';

export const WebGLRendererPluginOptions = Syringe.defineToken('WebGLRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface WebGLRendererPluginOptions {
  targets: ('webgl1' | 'webgl2')[];
  onContextCreationError: (e: Event) => void;
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
}

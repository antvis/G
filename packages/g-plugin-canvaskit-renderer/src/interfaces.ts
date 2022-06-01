import type { CanvasKit, Surface } from 'canvaskit-wasm';

export interface CanvasKitContext {
  CanvasKit: CanvasKit;
  surface: Surface;
}

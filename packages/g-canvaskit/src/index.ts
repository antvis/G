import type { RendererConfig } from '@antv/g-lite';
import {
  AbstractRenderer,
  ImageLoader,
  HTMLRenderer,
  DomInteraction,
} from '@antv/g-lite';
import { CanvasPathGenerator, CanvasPicker } from '@antv/g-canvas';
import * as CanvaskitRenderer from '@antv/g-plugin-canvaskit-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export * from './CanvasKitContextService';
export {
  CanvasPathGenerator,
  CanvasPicker,
  CanvaskitRenderer,
  DomInteraction,
  HTMLRenderer,
  ImageLoader,
};

interface CanvaskitRendererConfig extends RendererConfig {
  wasmDir?: string;
  fonts?: {
    name: string;
    url: string;
  }[];
}

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<CanvaskitRendererConfig>) {
    super(config);

    const canvaskitRendererPlugin = new CanvaskitRenderer.Plugin({
      fonts: config?.fonts || [],
    });

    // register Canvas2DContext
    this.registerPlugin(
      new ContextRegisterPlugin({
        wasmDir:
          config?.wasmDir || 'https://unpkg.com/canvaskit-wasm@0.34.0/bin/',
        canvaskitRendererPlugin,
      }),
    );
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(canvaskitRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}

import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as CanvasPathGenerator from '@antv/g-plugin-canvas-path-generator';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as CanvaskitRenderer from '@antv/g-plugin-canvaskit-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
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

    // register Canvas2DContext
    this.registerPlugin(
      new ContextRegisterPlugin({
        wasmDir: config?.wasmDir || 'https://unpkg.com/canvaskit-wasm@0.34.0/bin/',
      }),
    );
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(
      new CanvaskitRenderer.Plugin({
        fonts: config?.fonts || [],
      }),
    );
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}

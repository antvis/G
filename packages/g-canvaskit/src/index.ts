import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as CanvaskitRenderer from '@antv/g-plugin-canvaskit-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
// import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';
export * from './CanvasKitContextService';

interface CanvaskitRendererConfig extends RendererConfig {
  wasmUrl?: string;
}

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<CanvaskitRendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(
      new ContextRegisterPlugin({
        wasmUrl: config?.wasmUrl,
      }),
    );
    this.registerPlugin(new ImageLoader.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvaskitRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    // this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}

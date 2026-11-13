import type { RendererConfig } from '@antv/g-lite';
import {
  AbstractRenderer,
  ImageLoader,
  HTMLRenderer,
  DomInteraction,
} from '@antv/g-lite';
import * as CanvasRenderer from './plugins/canvas-renderer';
import * as CanvasPicker from './plugins/picker';
import * as CanvasPathGenerator from './plugins/path-generator';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export interface CanvasRendererConfig extends RendererConfig {
  /** Experimental HTML-in-Canvas rendering; falls back to overlay if unsupported. */
  htmlRendering: 'overlay' | 'native';
}

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<CanvasRendererConfig>) {
    const useNativeHTML =
      config?.htmlRendering === 'native' && supportsNativeHTMLInCanvas();
    const rendererConfig: Partial<CanvasRendererConfig> = {
      ...config,
      htmlRendering: useNativeHTML ? 'native' : 'overlay',
    };
    super(rendererConfig);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin({ useNativeHTML }));
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin(useNativeHTML));
  }

  override getConfig(): CanvasRendererConfig {
    return super.getConfig() as CanvasRendererConfig;
  }
}

function supportsNativeHTMLInCanvas(): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas') as HTMLCanvasElement & {
    content?: string;
    requestPaint?: () => void;
  };
  canvas.setAttribute('content', 'drawable');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D & {
    drawElementImage?: (element: Element, x: number, y: number) => void;
  };
  return (
    canvas.content === 'drawable' &&
    typeof canvas.requestPaint === 'function' &&
    typeof context?.drawElementImage === 'function'
  );
}

// plugins
export type { PathGenerator } from './plugins/path-generator';
export { CanvasRenderer, CanvasPicker, CanvasPathGenerator };
export { DomInteraction, HTMLRenderer, ImageLoader };

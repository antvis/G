import type {
  CanvasContext,
  CanvasLike,
  DataURLOptions,
  GlobalRuntime,
  CanvasConfig,
  ContextService,
} from '@antv/g-lite';
import { isBrowser, setDOMSize } from '@antv/g-lite';
import type * as CanvaskitRenderer from '@antv/g-plugin-canvaskit-renderer';
import type { CanvasKitContext } from '@antv/g-plugin-canvaskit-renderer';
import { isString } from '@antv/util';
import type { CanvasKit } from 'canvaskit-wasm';
// eslint-disable-next-line import/extensions
import CanvasKitInit from 'canvaskit-wasm/bin/full/canvaskit.js';

export interface ContextRegisterPluginOptions {
  wasmDir: string;
  canvaskitRendererPlugin: CanvaskitRenderer.Plugin;
}

/**
 * @see https://skia.org/docs/user/modules/quickstart/
 */
export class CanvasKitContextService
  implements ContextService<CanvasKitContext>
{
  private $container: HTMLElement | null;
  private $canvas: CanvasLike | null;
  private dpr: number;
  private context: CanvasKitContext;

  private canvasConfig: Partial<CanvasConfig>;
  private contextRegisterPluginOptions: ContextRegisterPluginOptions;

  constructor(context: GlobalRuntime & CanvasContext) {
    this.canvasConfig = context.config;
    // @ts-ignore
    this.contextRegisterPluginOptions = context.contextRegisterPluginOptions;
  }

  async initAsync() {
    const { container, canvas, devicePixelRatio } = this.canvasConfig;

    if (canvas) {
      this.$canvas = canvas;

      if (
        container &&
        (canvas as HTMLCanvasElement).parentElement !== container
      ) {
        (container as HTMLElement).appendChild(canvas as HTMLCanvasElement);
      }

      this.$container = (canvas as HTMLCanvasElement).parentElement;
      this.canvasConfig.container = this.$container;
    } else if (container) {
      // create container
      this.$container = isString(container)
        ? document.getElementById(container)
        : container;
      if (this.$container) {
        // create canvas
        const $canvas = document.createElement('canvas');

        this.$container.appendChild($canvas);
        if (!this.$container.style.position) {
          this.$container.style.position = 'relative';
        }
        this.$canvas = $canvas;
      }
    }

    // use user-defined dpr first
    let dpr = devicePixelRatio || (isBrowser && window.devicePixelRatio) || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;
    this.resize(this.canvasConfig.width, this.canvasConfig.height);

    // making surface must after canvas init
    const CanvasKit = await this.loadCanvaskit();
    const surface = CanvasKit.MakeWebGLCanvasSurface(
      this.$canvas as HTMLCanvasElement,
    );
    this.context = {
      surface,
      CanvasKit,
    };
  }

  getContext() {
    return this.context;
  }

  getDomElement() {
    return this.$canvas;
  }

  getDPR() {
    return this.dpr;
  }

  getBoundingClientRect() {
    if ((this.$canvas as HTMLCanvasElement).getBoundingClientRect) {
      return (this.$canvas as HTMLCanvasElement).getBoundingClientRect();
    }
  }

  destroy() {
    if (
      this.$container &&
      this.$canvas &&
      (this.$canvas as HTMLCanvasElement).parentNode
    ) {
      // destroy context
      this.$container.removeChild(this.$canvas as HTMLCanvasElement);
    }
  }

  resize(width: number, height: number) {
    if (this.$canvas) {
      // set canvas width & height
      this.$canvas.width = this.dpr * width;
      this.$canvas.height = this.dpr * height;

      // set CSS style width & height
      setDOMSize(this.$canvas, width, height);
    }
  }

  applyCursorStyle(cursor: string) {
    if (this.$container && this.$container.style) {
      this.$container.style.cursor = cursor;
    }
  }

  async toDataURL(options: Partial<DataURLOptions>) {
    return this.contextRegisterPluginOptions.canvaskitRendererPlugin.toDataURL(
      options,
    );
  }

  private loadCanvaskit(): Promise<CanvasKit> {
    return CanvasKitInit({
      locateFile: (file: string) =>
        this.contextRegisterPluginOptions.wasmDir + file,
    });
  }
}

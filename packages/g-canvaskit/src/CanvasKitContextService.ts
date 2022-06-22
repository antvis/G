import type { CanvasLike, DataURLOptions } from '@antv/g';
import {
  CanvasConfig,
  ContextService,
  inject,
  isBrowser,
  isString,
  setDOMSize,
  singleton,
  Syringe,
} from '@antv/g';
import type { CanvasKitContext } from '@antv/g-plugin-canvaskit-renderer';
import type { CanvasKit } from 'canvaskit-wasm';
import CanvasKitInit from 'canvaskit-wasm/bin/full/canvaskit.js';

export const ContextRegisterPluginOptions = Syringe.defineToken('ContextRegisterPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ContextRegisterPluginOptions {
  wasmDir: string;
}

/**
 * @see https://skia.org/docs/user/modules/quickstart/
 */
@singleton({ token: ContextService })
export class CanvasKitContextService implements ContextService<CanvasKitContext> {
  private $container: HTMLElement | null;
  private $canvas: CanvasLike | null;
  private dpr: number;
  private context: CanvasKitContext;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextRegisterPluginOptions)
  private contextRegisterPluginOptions: ContextRegisterPluginOptions;

  async init() {
    const { container, canvas, devicePixelRatio } = this.canvasConfig;

    if (canvas) {
      this.$canvas = canvas;

      if (container && (canvas as HTMLCanvasElement).parentElement !== container) {
        (container as HTMLElement).appendChild(canvas as HTMLCanvasElement);
      }

      this.$container = (canvas as HTMLCanvasElement).parentElement;
      this.canvasConfig.container = this.$container;
    } else if (container) {
      // create container
      this.$container = isString(container) ? document.getElementById(container) : container;
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
    const surface = CanvasKit.MakeWebGLCanvasSurface(this.$canvas as HTMLCanvasElement);
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
    // @ts-ignore
    if (this.$container && this.$canvas && this.$canvas.parentNode) {
      if (this.context?.surface) {
        this.context.surface.dispose();
      }
      // destroy context
      // @ts-ignore
      this.$container.removeChild(this.$canvas);
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
    return '';
  }

  private loadCanvaskit(): Promise<CanvasKit> {
    return CanvasKitInit({
      locateFile: (file: string) => this.contextRegisterPluginOptions.wasmDir + file,
    });
  }
}

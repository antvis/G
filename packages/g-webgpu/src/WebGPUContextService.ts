import type {
  CanvasContext,
  CanvasLike,
  DataURLOptions,
  GlobalRuntime,
  CanvasConfig,
  ContextService,
} from '@antv/g-lite';
import { setDOMSize } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { isString } from '@antv/util';

export class WebGPUContextService implements ContextService<GPUCanvasContext> {
  private $container: HTMLElement | null;
  private $canvas: CanvasLike | null;
  private dpr: number;

  private canvasConfig: Partial<CanvasConfig>;
  private deviceRendererPlugin: DeviceRenderer.Plugin;

  constructor(context: GlobalRuntime & CanvasContext) {
    this.canvasConfig = context.config;
    // @ts-ignore
    this.deviceRendererPlugin = context.deviceRendererPlugin;
  }

  init() {
    const { container, canvas } = this.canvasConfig;

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

    this.resize(this.canvasConfig.width, this.canvasConfig.height);
  }

  getDomElement() {
    return this.$canvas;
  }

  getContext() {
    return (
      // @ts-ignore
      this.deviceRendererPlugin.getDevice().canvasContext as GPUCanvasContext
    );
  }

  getBoundingClientRect() {
    if ((this.$canvas as HTMLCanvasElement).getBoundingClientRect) {
      return (this.$canvas as HTMLCanvasElement).getBoundingClientRect();
    }
  }

  destroy() {
    // @ts-ignore
    if (this.$container && this.$canvas && this.$canvas.parentNode) {
      // @ts-ignore
      this.$container.removeChild(this.$canvas);
    }
  }

  resize(width: number, height: number) {
    // use user-defined dpr first
    const { devicePixelRatio: dpr } = this.canvasConfig;
    this.dpr = dpr;

    if (this.$canvas) {
      const dpr = this.getDPR();

      // set canvas width & height
      this.$canvas.width = dpr * width;
      this.$canvas.height = dpr * height;

      // set CSS style width & height
      setDOMSize(this.$canvas, width, height);
    }
  }

  getDPR() {
    return this.dpr;
  }

  applyCursorStyle(cursor: string) {
    if (this.$container && this.$container.style) {
      this.$container.style.cursor = cursor;
    }
  }

  async toDataURL(options: Partial<DataURLOptions>) {
    return '';
  }
}

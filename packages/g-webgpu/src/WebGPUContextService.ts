import type { CanvasLike, DataURLOptions } from '@antv/g';
import { CanvasConfig, ContextService, inject, isBrowser, setDOMSize, singleton } from '@antv/g';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { isString } from '@antv/util';
import { DeviceRendererPlugin } from './tokens';

@singleton({ token: ContextService })
export class WebGPUContextService implements ContextService<GPUCanvasContext> {
  private $container: HTMLElement | null;
  private $canvas: CanvasLike | null;
  private dpr: number;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(DeviceRendererPlugin)
  private deviceRendererPlugin: DeviceRenderer.Plugin;

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
  }

  getDomElement() {
    return this.$canvas;
  }

  getContext() {
    // @ts-ignore
    return this.deviceRendererPlugin.getDevice().canvasContext as GPUCanvasContext;
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

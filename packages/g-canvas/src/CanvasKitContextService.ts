import type { ContextService } from '@antv/g';
import { CanvasConfig } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { setDOMSize } from './utils/dom';
import { CanvasKitInit } from 'canvaskit-wasm';

@injectable()
export class CanvasKitContextService implements ContextService<CanvasRenderingContext2D> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | null;
  private dpr: number;
  private context: CanvasRenderingContext2D | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  async init() {
    const { container, width, height } = this.canvasConfig;
    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      const CanvasKit = await CanvasKitInit();
      const skcanvas = CanvasKit.MakeCanvas(width, height);

      this.context = skcanvas.getContext('2d');
      this.$container.appendChild($canvas);
      this.$canvas = $canvas;

      let dpr = window.devicePixelRatio || 1;
      dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
      this.dpr = dpr;

      this.resize(width, height);
    }
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
    return this.$canvas?.getBoundingClientRect();
  }

  destroy() {
    if (this.$container && this.$canvas && this.$canvas.parentNode) {
      // destroy context
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
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }
}

import { CanvasConfig, ContextService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { isString } from '@antv/util';
import { setDOMSize } from './utils/dom';

@singleton({ token: ContextService })
export class WebGLContextService implements ContextService<WebGLRenderingContext> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | null;
  private context: WebGLRenderingContext | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container } = this.canvasConfig;

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

  getDomElement() {
    return this.$canvas;
  }

  getContext() {
    return this.context;
  }

  getBoundingClientRect() {
    return this.$container?.getBoundingClientRect();
  }

  destroy() {
    if (this.$container && this.$canvas && this.$canvas.parentNode) {
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
    let dpr = window.devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    return dpr;
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }
}

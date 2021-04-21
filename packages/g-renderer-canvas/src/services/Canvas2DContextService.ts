import { CanvasConfig, ContextService } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { setDOMSize } from '../utils/dom';

@injectable()
export class Canvas2DContextService implements ContextService<CanvasRenderingContext2D> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | null;
  private dpr: number;
  private context: CanvasRenderingContext2D | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      this.context = $canvas.getContext('2d');
      this.$container.appendChild($canvas);
      this.$canvas = $canvas;

      let dpr = window.devicePixelRatio || 1;
      dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
      this.dpr = dpr;
    }
  }

  getContext() {
    return this.context;
  }

  getCanvas() {
    return this.$canvas;
  }

  getDPR() {
    return this.dpr;
  }

  async destroy() {
    if (this.$container && this.$canvas) {
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

      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/scale
      const context = this.getContext();
      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      context?.scale(this.dpr, this.dpr);
    }
  }
}

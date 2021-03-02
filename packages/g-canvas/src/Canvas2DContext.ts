import { DefaultContextService } from '@antv/g-core';
import { injectable } from 'inversify';
import isString from 'lodash-es/isString';
import { setDOMSize } from './utils/dom';

@injectable()
export class Canvas2DContext extends DefaultContextService<CanvasRenderingContext2D> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | null;

  public async init() {
    const { container } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      const context = $canvas.getContext('2d');
      this.$container.appendChild($canvas);
      this.$canvas = $canvas;
      return context;
    }

    return null;
  }

  public async destroy() {
    // TODO: destroy context
  }

  public resize(width: number, height: number) {
    if (this.$canvas) {
      let dpr = window.devicePixelRatio || 1;
      dpr = dpr >= 1 ? Math.ceil(dpr) : 1;

      // set canvas width & height
      this.$canvas.width = dpr * width;
      this.$canvas.height = dpr * height;

      // set CSS style width & height
      setDOMSize(this.$canvas, width, height);

      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/scale
      const context = this.getContext();
      context?.scale(dpr, dpr);
    }
  }
}

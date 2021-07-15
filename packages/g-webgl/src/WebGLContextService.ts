import { Camera, CanvasConfig, ContextService } from '@antv/g';
import { inject, injectable } from 'inversify';
import { isString } from '@antv/util';
import { WebGLRenderingContext } from '@antv/g-plugin-webgl-renderer';
import { setDOMSize } from './utils/dom';

@injectable()
export class WebGLContextService implements ContextService<WebGLRenderingContext> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | null;
  private context: WebGLRenderingContext | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container, width, height } = this.canvasConfig;

    // create container
    this.$container = isString(container) ? document.getElementById(container) : container;
    if (this.$container) {
      // create canvas
      const $canvas = document.createElement('canvas');
      this.$container.appendChild($canvas);
      this.$canvas = $canvas;

      // this.camera.setPosition(0, 0, 1).setOrthographic(
      //   (width / -2) * dpr,
      //   (width / 2) * dpr,
      //   (height / 2) * dpr,
      //   (height / -2) * dpr,
      //   // 0,
      //   // width * dpr,
      //   // height * dpr,
      //   // 0,
      //   0.5,
      //   2
      // );
      // this.camera.setViewOffset(2, 2, 0, 0, 2, 2);

      // this.context = {
      //   engine: this.engine,
      //   camera: this.camera,
      //   view: this.view,
      // };
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
    if (this.$container && this.$canvas) {
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

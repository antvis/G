import { CanvasConfig, ContextService, isString, setDOMSize } from '@antv/g';
import { inject, singleton } from 'mana-syringe';

@singleton({ token: ContextService })
export class Canvas2DContextService implements ContextService<CanvasRenderingContext2D> {
  private $container: HTMLElement | null;
  private $canvas: HTMLCanvasElement | OffscreenCanvas | null;
  private dpr: number;
  private width: number;
  private height: number;
  private context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { container, canvas, devicePixelRatio, width, height } = this.canvasConfig;

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

    const $canvas = this.$canvas;
    this.context = $canvas.getContext('2d');
    this.dpr = devicePixelRatio;

    const canvasWidth = width || $canvas.width / devicePixelRatio;
    const canvasHeight = height || $canvas.height / devicePixelRatio;
    this.resize(canvasWidth, canvasHeight);
  }

  getContext() {
    return this.context as CanvasRenderingContext2D;
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

      const dpr = this.getDPR();
      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      this.context.scale(dpr, dpr);
    }
    this.width = width;
    this.height = height;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  applyCursorStyle(cursor: string) {
    if (this.$container && this.$container.style) {
      this.$container.style.cursor = cursor;
    }
  }
}

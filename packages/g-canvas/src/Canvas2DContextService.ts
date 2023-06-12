import type {
  RenderingContext,
  CanvasContext,
  CanvasLike,
  DataURLOptions,
  GlobalRuntime,
  CanvasConfig,
  ContextService,
} from '@antv/g-lite';
import { RenderReason, isBrowser, setDOMSize } from '@antv/g-lite';
import { isString } from '@antv/util';

export class Canvas2DContextService
  implements ContextService<CanvasRenderingContext2D>
{
  private $container: HTMLElement | null;
  private $canvas: CanvasLike | null;
  private dpr: number;
  private context:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  private canvasConfig: Partial<CanvasConfig>;
  private renderingContext: RenderingContext;

  constructor(context: GlobalRuntime & CanvasContext) {
    this.renderingContext = context.renderingContext;
    this.canvasConfig = context.config;
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

    this.context = this.$canvas.getContext('2d');
    this.resize(this.canvasConfig.width, this.canvasConfig.height);
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
    const { devicePixelRatio } = this.canvasConfig;

    // use user-defined dpr first
    let dpr = devicePixelRatio || (isBrowser && window.devicePixelRatio) || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;

    if (this.$canvas) {
      // set canvas width & height
      this.$canvas.width = this.dpr * width;
      this.$canvas.height = this.dpr * height;

      // set CSS style width & height
      setDOMSize(this.$canvas, width, height);

      // const dpr = this.getDPR();
      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      // this.context.scale(dpr, dpr);
    }

    this.renderingContext.renderReasons.add(RenderReason.CAMERA_CHANGED);
  }

  applyCursorStyle(cursor: string) {
    if (this.$container && this.$container.style) {
      this.$container.style.cursor = cursor;
    }
  }

  async toDataURL(options: Partial<DataURLOptions> = {}) {
    const { type, encoderOptions } = options;
    return (this.context.canvas as HTMLCanvasElement).toDataURL(
      type,
      encoderOptions,
    );
  }
}

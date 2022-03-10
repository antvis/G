import { CanvasConfig, ContextService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';

@singleton({ token: ContextService })
export class Canvas2DContextService implements ContextService<CanvasRenderingContext2D> {
  private $canvas: HTMLCanvasElement;
  private dpr: number;
  private context: CanvasRenderingContext2D;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { canvas, devicePixelRatio } = this.canvasConfig;
    this.$canvas = canvas as HTMLCanvasElement;
    // 实际获取到小程序环境的上下文
    this.context = this.$canvas.getContext('2d');

    // use user-defined dpr first
    let dpr = devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;

    this.resize(this.canvasConfig.width, this.canvasConfig.height);
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
    // TODO: 小程序环境销毁 context
  }

  resize(width: number, height: number) {
    if (this.$canvas) {
      // set canvas width & height
      this.$canvas.width = this.dpr * width;
      this.$canvas.height = this.dpr * height;

      // TODO: 小程序环境设置 canvas 的 width & height
      // set CSS style width & height
      // setDOMSize(this.$canvas, width, height);

      const dpr = this.getDPR();
      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      this.context.scale(dpr, dpr);
    }
  }

  applyCursorStyle(cursor: string) {
    // 小程序环境无需设置鼠标样式
  }
}

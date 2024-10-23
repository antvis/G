import type {
  CanvasContext,
  DataURLOptions,
  GlobalRuntime,
  CanvasConfig,
  ContextService,
} from '@antv/g-lite';
import { isCanvasElement } from './dom';

export class Canvas2DContextService
  implements ContextService<CanvasRenderingContext2D>
{
  private $canvas: HTMLCanvasElement;
  private dpr: number;
  private context: CanvasRenderingContext2D;

  private canvasConfig: Partial<CanvasConfig>;

  constructor(context: GlobalRuntime & CanvasContext) {
    this.canvasConfig = context.config;
  }

  async init() {
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
    if (this.$canvas.getBoundingClientRect) {
      return this.$canvas.getBoundingClientRect();
    }
  }

  destroy() {
    // TODO: 小程序环境销毁 context
    this.context = null;
    this.$canvas = null;
  }

  resize(width: number, height: number) {
    const { devicePixelRatio } = this.canvasConfig;
    const pixelRatio = devicePixelRatio;
    const canvasDOM = this.$canvas; // HTMLCanvasElement or canvasElement

    // 浏览器环境设置style样式
    if (canvasDOM.style) {
      canvasDOM.style.width = `${width}px`;
      canvasDOM.style.height = `${height}px`;
    }

    if (isCanvasElement(canvasDOM)) {
      canvasDOM.width = width * pixelRatio;
      canvasDOM.height = height * pixelRatio;

      if (pixelRatio !== 1) {
        this.context.scale(pixelRatio, pixelRatio);
      }
    }
  }

  applyCursorStyle(cursor: string) {
    // 小程序环境无需设置鼠标样式
  }

  async toDataURL(options: Partial<DataURLOptions>) {
    const { type, encoderOptions } = options;
    return this.context.canvas.toDataURL(type, encoderOptions);
  }
}

import type { CanvasLike } from '@antv/g';
import { CanvasConfig, ContextService, inject, singleton } from '@antv/g';
import { isCanvasElement } from './dom';

@singleton({ token: ContextService })
export class WebGLContextService implements ContextService<WebGLRenderingContext> {
  private $canvas: CanvasLike | null;
  private dpr: number;
  private context: WebGLRenderingContext | null;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  async init() {
    const { canvas, devicePixelRatio } = this.canvasConfig;
    this.$canvas = canvas;
    // 实际获取到小程序环境的上下文
    this.context = this.$canvas.getContext('webgl');

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
    if ((this.$canvas as unknown as HTMLCanvasElement).getBoundingClientRect) {
      return (this.$canvas as unknown as HTMLCanvasElement).getBoundingClientRect();
    }
  }

  destroy() {
    // TODO: 小程序环境销毁 context
    this.context = null;
    this.$canvas = null;
  }

  resize(width: number, height: number) {
    const pixelRatio = devicePixelRatio;
    const canvasDOM = this.$canvas; // HTMLCanvasElement or canvasElement

    // 浏览器环境设置style样式
    // @ts-ignore 使用style功能判断不使用类型判断更准确
    if (canvasDOM.style) {
      // @ts-ignore
      canvasDOM.style.width = width + 'px';
      // @ts-ignore
      canvasDOM.style.height = height + 'px';
    }

    if (isCanvasElement(canvasDOM)) {
      canvasDOM.width = width * pixelRatio;
      canvasDOM.height = height * pixelRatio;

      // if (pixelRatio !== 1) {
      //   this.context.scale(pixelRatio, pixelRatio);
      // }
    }
  }

  applyCursorStyle(cursor: string) {
    // 小程序环境无需设置鼠标样式
  }
}

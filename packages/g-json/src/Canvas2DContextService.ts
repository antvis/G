import { CanvasConfig, ContextService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { isCanvasElement } from './dom';

@singleton({ token: ContextService })
export class Canvas2DContextService implements ContextService<null> {
  private $canvas: HTMLCanvasElement;
  private dpr: number;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { canvas, devicePixelRatio } = this.canvasConfig;
    this.$canvas = canvas as HTMLCanvasElement;
    // use user-defined dpr first
    let dpr = devicePixelRatio || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;

    this.resize(this.canvasConfig.width, this.canvasConfig.height);
  }

  getContext() {
    return null;
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
    this.$canvas = null;
  }

  resize(width: number, height: number) {
    const pixelRatio = devicePixelRatio;
    const canvasDOM = this.$canvas; // HTMLCanvasElement or canvasElement

    // 浏览器环境设置style样式
    if (canvasDOM.style) {
      canvasDOM.style.width = width + 'px';
      canvasDOM.style.height = height + 'px';
    }

    if (isCanvasElement(canvasDOM)) {
      canvasDOM.width = width * pixelRatio;
      canvasDOM.height = height * pixelRatio;

      if (pixelRatio !== 1) {
        // this.context.scale(pixelRatio, pixelRatio);
      }
    }
  }

  applyCursorStyle(cursor: string) {
    // 小程序环境无需设置鼠标样式
  }
}

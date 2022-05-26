import { CanvasConfig, ContextService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import CanvasElement from './canvas-element';
import { getWidth, getHeight, isCanvasElement } from './dom';

@singleton({ token: ContextService })
export class Canvas2DContextService implements ContextService<CanvasRenderingContext2D> {
  private $canvas: HTMLCanvasElement;
  private dpr: number;
  private width: number;
  private height: number;
  private context: CanvasRenderingContext2D;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  init() {
    const { canvas, context, devicePixelRatio, width, height } = this.canvasConfig;
    if (!canvas && !context) {
      throw new Error('Please specify the canvas or context');
    }

    let $canvas = canvas as HTMLCanvasElement;
    if (!$canvas) {
      $canvas = CanvasElement.create(context);
      if (!$canvas.getContext) {
        // @ts-ignore
        canvas.getContext = function () {
          return context;
        };
      }
    }

    const canvasWidth = width || getWidth($canvas) || $canvas.width;
    const canvasHeight = height || getHeight($canvas) || $canvas.height;

    this.$canvas = $canvas;
    this.context = (context as CanvasRenderingContext2D) || $canvas.getContext('2d');
    this.dpr = devicePixelRatio;

    this.resize(canvasWidth, canvasHeight);
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
    // 需要清理 canvas 画布内容，否则会导致 spa 应用 ios 下 canvas 白屏
    // https://stackoverflow.com/questions/52532614/total-canvas-memory-use-exceeds-the-maximum-limit-safari-12
    // https://github.com/antvis/F2/issues/630
    const $canvas = this.$canvas;
    $canvas.width = 0;
    $canvas.height = 0;

    this.context = null;
    this.$canvas = null;
  }

  resize(width: number, height: number) {
    const pixelRatio = this.getDPR();
    const canvasDOM = this.$canvas; // HTMLCanvasElement

    // 浏览器环境设置style样式
    if (canvasDOM.style) {
      canvasDOM.style.width = width + 'px';
      canvasDOM.style.height = height + 'px';
    }

    if (isCanvasElement(canvasDOM)) {
      canvasDOM.width = width * pixelRatio;
      canvasDOM.height = height * pixelRatio;

      if (pixelRatio !== 1) {
        this.context.scale(pixelRatio, pixelRatio);
      }
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
    // 小程序环境无需设置鼠标样式
  }
}

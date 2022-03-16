import { EventEmitter } from 'eventemitter3';

class CanvasElement {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  isCanvasElement = true;
  emitter = new EventEmitter();

  constructor(ctx: CanvasRenderingContext2D) {
    this.context = ctx;
    // canvas实际的宽高 (width/height) * pixelRatio

    // 有可能是 node canvas 创建的 context 对象
    const canvas = ctx.canvas || ({} as HTMLCanvasElement);
    this.width = canvas.width || 0;
    this.height = canvas.height || 0;
  }

  getContext(/* type */) {
    return this.context;
  }

  getBoundingClientRect() {
    const width = this.width;
    const height = this.height;
    // 默认都处理成可视窗口的顶部位置
    return {
      top: 0,
      right: width,
      bottom: height,
      left: 0,
      width,
      height,
      x: 0,
      y: 0,
    };
  }

  addEventListener(type: string, listener) {
    this.emitter.on(type, listener);
  }

  removeEventListener(type: string, listener) {
    this.emitter.off(type, listener);
  }

  dispatchEvent(type: string, e) {
    this.emitter.emit(type, e);
  }
}

function supportEventListener(canvas: HTMLCanvasElement) {
  if (!canvas) {
    return false;
  }
  // 非 HTMLCanvasElement
  if (canvas.nodeType !== 1 || !canvas.nodeName || canvas.nodeName.toLowerCase() !== 'canvas') {
    return false;
  }
  // 微信小程序canvas.getContext('2d')时也是CanvasRenderingContext2D
  // 也会有ctx.canvas, 而且nodeType也是1，所以还要在看下是否支持addEventListener
  let support = false;
  try {
    canvas.addEventListener('eventTest', () => {
      support = true;
    });
    canvas.dispatchEvent(new Event('eventTest'));
  } catch (error) {
    support = false;
  }
  return support;
}

export default {
  create(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    if (!ctx) {
      return null;
    }
    if (supportEventListener(ctx.canvas)) {
      return ctx.canvas;
    }

    return new CanvasElement(ctx) as unknown as HTMLCanvasElement;
  },
};

import type { CanvasLike } from '@antv/g-lite';
import EventEmitter from 'eventemitter3';

class CanvasElement implements CanvasLike {
  width: number;
  height: number;
  isCanvasElement = true;

  private context:
    | CanvasRenderingContext2D
    | WebGLRenderingContext
    | WebGL2RenderingContext;

  private emitter = new EventEmitter();

  constructor(
    ctx:
      | CanvasRenderingContext2D
      | WebGLRenderingContext
      | WebGL2RenderingContext,
  ) {
    this.context = ctx;

    // 有可能是 node canvas 创建的 context 对象
    const canvas = ctx.canvas || ({} as HTMLCanvasElement);
    this.width = canvas.width || 0;
    this.height = canvas.height || 0;
  }

  getContext(
    contextId: '2d',
    contextAttributes?: CanvasRenderingContext2DSettings,
  ): CanvasRenderingContext2D;
  getContext(
    contextId: 'webgl',
    contextAttributes?: WebGLContextAttributes,
  ): WebGLRenderingContext;
  getContext(
    contextId: 'webgl2',
    contextAttributes?: WebGLContextAttributes,
  ): WebGL2RenderingContext;
  getContext(
    contextId: any,
    contextAttributes?: any,
  ): CanvasRenderingContext2D | WebGLRenderingContext | WebGL2RenderingContext {
    return this.context;
  }

  getBoundingClientRect() {
    const { width } = this;
    const { height } = this;
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

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: any, listener: any, options?: any): void {
    // TODO: implement options
    this.emitter.on(type, listener);
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(type: any, listener: any, options?: any): void {
    this.emitter.off(type, listener);
  }

  /**
   * @see https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget-dispatchEvent
   */
  dispatchEvent(e: Event) {
    this.emitter.emit(e.type, e);
    return true;
  }
}

function supportEventListener(canvas: HTMLCanvasElement) {
  if (!canvas) {
    return false;
  }
  // 非 HTMLCanvasElement
  if (
    canvas.nodeType !== 1 ||
    !canvas.nodeName ||
    canvas.nodeName.toLowerCase() !== 'canvas'
  ) {
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
  } catch {
    support = false;
  }
  return support;
}

export function createMobileCanvasElement(
  ctx:
    | CanvasRenderingContext2D
    | WebGLRenderingContext
    | WebGL2RenderingContext,
): CanvasLike {
  if (!ctx) {
    return null;
  }
  if (supportEventListener(ctx.canvas as HTMLCanvasElement)) {
    return ctx.canvas as CanvasLike;
  }

  return new CanvasElement(ctx);
}

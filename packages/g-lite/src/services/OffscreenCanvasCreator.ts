import type { CanvasLike } from '..';
import { runtime } from '..';

/**
 * used in following scenes:
 * - g `ctx.measureText`
 * - g-plugin-canvas-picker `ctx.isPointInPath`
 * - g-plugin-device-renderer `ctx.createLinearGradient` and generate texture
 *
 * @see https://blog.scottlogic.com/2020/03/19/offscreen-canvas.html
 */
export class OffscreenCanvasCreator {
  private canvas: CanvasLike;
  private context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  getOrCreateCanvas(
    offscreenCanvas: CanvasLike,
    contextAttributes?: CanvasRenderingContext2DSettings,
  ): CanvasLike {
    if (this.canvas) {
      return this.canvas;
    }

    // user-defined offscreen canvas
    if (offscreenCanvas || runtime.offscreenCanvas) {
      this.canvas = offscreenCanvas || runtime.offscreenCanvas;
      this.context = this.canvas.getContext('2d', contextAttributes);
    } else {
      try {
        // OffscreenCanvas2D measureText can be up to 40% faster.
        this.canvas = new window.OffscreenCanvas(0, 0) as unknown as CanvasLike;
        this.context = this.canvas.getContext('2d', contextAttributes);
        if (!this.context || !this.context.measureText) {
          this.canvas = document.createElement('canvas');
          this.context = this.canvas.getContext('2d');
        }
      } catch (ex) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d', contextAttributes);
      }
    }

    this.canvas.width = 10;
    this.canvas.height = 10;

    return this.canvas;
  }

  getOrCreateContext(
    offscreenCanvas: CanvasLike,
    contextAttributes?: CanvasRenderingContext2DSettings,
  ) {
    if (this.context) {
      return this.context;
    }

    this.getOrCreateCanvas(offscreenCanvas, contextAttributes);
    return this.context;
  }
}

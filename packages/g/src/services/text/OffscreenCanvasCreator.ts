import { inject, singleton } from 'mana-syringe';
import { CanvasConfig } from '../../types';

/**
 * used in following scenes:
 * - g `ctx.measureText`
 * - g-plugin-canvas-picker `ctx.isPointInPath`
 * - g-plugin-webgl-renderer `ctx.createLinearGradient` and generate texture
 */
@singleton()
export class OffscreenCanvasCreator {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  getOrCreateCanvas(): HTMLCanvasElement | OffscreenCanvas {
    if (this.canvas) {
      return this.canvas;
    }

    const { offscreenCanvas } = this.canvasConfig;
    // user-defined offscreen canvas
    if (offscreenCanvas) {
      this.canvas = offscreenCanvas;
      this.context = this.canvas.getContext('2d');
    } else {
      try {
        // OffscreenCanvas2D measureText can be up to 40% faster.
        this.canvas = new window.OffscreenCanvas(0, 0);
        this.context = this.canvas.getContext('2d')!;
        if (!this.context || !this.context.measureText) {
          this.canvas = document.createElement('canvas');
          this.context = this.canvas.getContext('2d')!;
        }
      } catch (ex) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;
      }
    }

    this.canvas.width = 10;
    this.canvas.height = 10;

    return this.canvas;
  }

  getOrCreateContext() {
    if (this.context) {
      return this.context;
    }

    this.getOrCreateCanvas();
    return this.context;
  }
}

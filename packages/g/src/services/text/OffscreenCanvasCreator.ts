import { injectable } from 'inversify';

@injectable()
export class OffscreenCanvasCreator {
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

  getOrCreateCanvas(): OffscreenCanvas | HTMLCanvasElement {
    if (this.canvas) {
      return this.canvas;
    }

    try {
      // OffscreenCanvas2D measureText can be up to 40% faster.
      this.canvas = new OffscreenCanvas(0, 0);
      this.context = this.canvas.getContext('2d')!;
      if (!this.context || !this.context.measureText) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;
      }
    } catch (ex) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d')!;
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

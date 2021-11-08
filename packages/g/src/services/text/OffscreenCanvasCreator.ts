import { singleton } from 'mana-syringe';

@singleton()
export class OffscreenCanvasCreator {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  getOrCreateCanvas(): HTMLCanvasElement {
    if (this.canvas) {
      return this.canvas;
    }

    try {
      // OffscreenCanvas2D measureText can be up to 40% faster.
      // @ts-ignore
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

import { type Canvas, Rect, CanvasEvent } from '@antv/g-local';
import { TestCase, type TestOptions } from '../../../../base';

export class RectCase extends TestCase<Canvas> {
  name = 'rect';
  private rects: Rect[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const rect = new Rect({
        style: {
          x,
          y,
          width: 100,
          height: 100,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.appendChild(rect);
      this.rects.push(rect);
    }

    return new Promise((resolve) => {
      app.addEventListener(CanvasEvent.RERENDER, () => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.rects.forEach((rect) => rect.remove());
    this.rects = [];

    await super.cleanup(app);
  }
}

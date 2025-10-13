import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class RectCase extends TestCase<Canvas> {
  name = 'rect';
  private rects: Shape.Rect[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const rect = new Shape.Rect({
        type: 'rect',
        attrs: {
          x,
          y,
          width: 100,
          height: 100,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.add(rect);
      this.rects.push(rect);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.rects.forEach((rect) => rect.remove());
    this.rects = [];

    await super.cleanup(app);
  }
}

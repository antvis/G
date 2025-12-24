import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class LineCase extends TestCase<Canvas> {
  name = 'line';
  private lines: Shape.Line[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const line = new Shape.Line({
        type: 'line',
        attrs: {
          x1: x,
          y1: y,
          x2: x + 100,
          y2: y + 50,
          stroke: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          lineWidth: 4,
        },
      });

      app.add(line);
      this.lines.push(line);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.lines.forEach((line) => line.remove());
    this.lines = [];

    await super.cleanup(app);
  }
}

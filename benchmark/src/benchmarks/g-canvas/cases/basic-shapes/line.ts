import { type Canvas, Line, CanvasEvent } from '@antv/g';
import { TestCase, type TestOptions } from '../../../../base';

export class LineCase extends TestCase<Canvas> {
  name = 'line';
  private lines: Line[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const line = new Line({
        style: {
          x1: x,
          y1: y,
          x2: x + 100,
          y2: y + 100,
          stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
          lineWidth: 2,
        },
      });

      app.appendChild(line);
      this.lines.push(line);
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
    this.lines.forEach((line) => line.remove());
    this.lines = [];

    await super.cleanup(app);
  }
}

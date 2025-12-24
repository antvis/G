import { type ZRenderType, Line } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class LineCase extends TestCase<ZRenderType> {
  readonly name = 'line';
  private lines: Line[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const line = new Line({
        shape: {
          x1: x,
          y1: y,
          x2: x + 100,
          y2: y + 100,
        },
        style: {
          stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
          lineWidth: 2,
        },
      });

      this.lines.push(line);
      app.add(line);
    }

    return new Promise((resolve) => {
      app.on('rendered', () => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  protected async cleanup(app: ZRenderType): Promise<void> {
    this.lines.forEach((line) => app.remove(line));
    this.lines = [];

    await super.cleanup(app);
  }
}

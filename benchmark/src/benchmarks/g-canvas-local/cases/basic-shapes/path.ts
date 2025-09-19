import { type Canvas, Path, CanvasEvent } from '@antv/g-local';
import { TestCase, type TestOptions } from '../../../../base';

export class PathCase extends TestCase<Canvas> {
  name = 'path';
  private paths: Path[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const path = new Path({
        style: {
          d: `M ${x} ${y} L ${x + 100} ${y} L ${x + 100} ${y + 100} L ${x} ${y + 100} Z`,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.appendChild(path);
      this.paths.push(path);
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
    this.paths.forEach((path) => path.remove());
    this.paths = [];

    await super.cleanup(app);
  }
}

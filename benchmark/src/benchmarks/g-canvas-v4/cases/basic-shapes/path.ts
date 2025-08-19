import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class PathCase extends TestCase<Canvas> {
  name = 'path';
  private paths: Shape.Path[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const path = new Shape.Path({
        type: 'path',
        attrs: {
          path: `M ${x} ${y} L ${x + 100} ${y} L ${x + 100} ${y + 50} L ${x} ${y + 50} Z`,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.add(path);
      this.paths.push(path);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.paths.forEach((path) => path.remove());
    this.paths = [];

    await super.cleanup(app);
  }
}

import { type ZRenderType, Path } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class PathCase extends TestCase<ZRenderType> {
  readonly name = 'path';
  private paths: Path[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const path = new Path({
        shape: {
          pathData: `M ${x} ${y} L ${x + 100} ${y} L ${x + 100} ${y + 100} L ${x} ${y + 100} Z`,
        },
        style: {
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      this.paths.push(path);
      app.add(path);
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
    this.paths.forEach((path) => app.remove(path));
    this.paths = [];

    await super.cleanup(app);
  }
}
